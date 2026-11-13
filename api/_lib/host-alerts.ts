// Problems the host dashboard shows at the top: upcoming nights booked past
// what the camp has, and payments that went through but never confirmed.

import { site } from '../../src/content/site.js'
import { addMonths } from '../../src/content/booking.js'
import { db, stripe } from './server.js'

export type Alert = { kind: 'overbooked' | 'gear' | 'unconfirmed'; text: string; night?: string; bookingId?: string }

// Upcoming nights where bookings alone (not blocks) take more sites, hookups
// or rental gear than the camp has.
export const overbooked = async (today: string, limits: Record<string, number>): Promise<Alert[]> => {
  const end = addMonths(today, site.bookingWindowMonths + 1)
  const [nights, items] = await Promise.all([
    db().query(
      `select d::date::text as night, sum(b.sites)::int as sites, sum(b.hookups)::int as hookups
         from generate_series($1::date, $2::date, interval '1 day') as d
         join bookings b on b.arrive <= d::date and b.depart > d::date
          and (b.status = 'confirmed' or (b.status = 'held' and b.hold_expires_at > now()))
        group by d
       having sum(b.sites) > $3 or sum(b.hookups) > $4
        order by d`,
      [today, end, site.siteCount, site.hookupsPerNight],
    ),
    db().query('select night::text, item, used from item_usage($1, $2)', [today, end]),
  ])
  return [
    ...(nights as { night: string; sites: number; hookups: number }[]).map(
      (n): Alert => ({
        kind: 'overbooked',
        night: String(n.night).slice(0, 10),
        text:
          n.sites > site.siteCount
            ? `${n.sites} sites booked, but the camp has ${site.siteCount}`
            : `${n.hookups} electric hookups booked, but only ${site.hookupsPerNight} are sold a night`,
      }),
    ),
    ...(items as { night: string; item: string; used: number }[])
      .filter((i) => i.item !== 'Electric hookup' && limits[i.item] != null && i.used > limits[i.item])
      .map(
        (i): Alert => ({
          kind: 'gear',
          night: String(i.night).slice(0, 10),
          text: `${i.used} × ${i.item} booked, but you have ${limits[i.item]}`,
        }),
      ),
  ]
}

// Payments from the last two weeks that Stripe took but whose booking never
// turned to paid here (the confirmation failed). Skipped if Stripe can't be reached.
export const unconfirmed = async (): Promise<Alert[]> => {
  try {
    const since = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60
    const sessions = await stripe().checkout.sessions.list({ created: { gte: since }, status: 'complete', limit: 100 })
    const paid = sessions.data.filter((x) => x.payment_status === 'paid' && /^[0-9a-f-]{36}$/.test(x.metadata?.booking_id ?? ''))
    if (!paid.length) return []
    const ids = paid.map((x) => x.metadata!.booking_id)
    const rows = (await db().query('select id::text, status from bookings where id = any($1::uuid[])', [ids])) as
      { id: string; status: string }[]
    const status = new Map(rows.map((r) => [r.id, r.status]))
    return paid
      .filter((x) => !['confirmed', 'cancelled'].includes(status.get(x.metadata!.booking_id) ?? ''))
      .map(
        (x): Alert => ({
          kind: 'unconfirmed',
          bookingId: x.metadata!.booking_id,
          text: `${x.customer_details?.name || 'A guest'} (${x.customer_details?.email || 'no email'}) paid $${((x.amount_total ?? 0) / 100).toFixed(2)}, but the booking didn’t confirm, so they got no confirmation email. If db/schema.sql changed, run it in Neon, then resend the event in Stripe (Developers → Webhooks).`,
        }),
      )
  } catch (e) {
    console.error('Unconfirmed payment check skipped:', e instanceof Error ? e.message : e)
    return []
  }
}
