// POST /api/checkout
// Checks the stay, holds the sites, and opens a Stripe payment page.
// The booking is confirmed by the Stripe webhook once payment succeeds.

import type Stripe from 'stripe'
import { addOns, site } from '../src/content/site.js'
import { formatDay, hookupsIn, pickedAddOns, quoteStay, todayIso, type Stay } from '../src/content/booking.js'
import { bookingColumns, db, env, handle, json, origin, stripe, type BookingRow } from './_lib/server.js'
import { sendBookingEmails } from './_lib/email.js'

// Sites are held for 10 minutes. Stripe payment pages must stay open at least
// 30 minutes, so once a hold runs out its page can still be open: before
// holding, reclaimStaleHolds closes any such page on the same nights, so
// nobody can pay for sites that were given to someone else.
const PAY_MINUTES = 31
const HOLD_MINUTES = 10

type Body = Partial<Omit<Stay, 'extras'>> & { extras?: unknown; name?: string; email?: string; phone?: string; note?: string }

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Only known add-ons, with whole-number quantities.
const readExtras = (v: unknown): Record<string, number> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const out: Record<string, number> = {}
  for (const a of addOns) {
    const n = (v as Record<string, unknown>)[a.name]
    if (typeof n === 'number' && Number.isInteger(n) && n > 0) out[a.name] = n
  }
  return out
}
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export const POST = (request: Request) =>
  handle(async () => {
    const body = (await request.json().catch(() => ({}))) as Body
    const stay: Stay = {
      arrive: text(body.arrive, 10),
      depart: text(body.depart, 10),
      sites: Number.isInteger(body.sites) ? Number(body.sites) : 0,
      guests: Number.isInteger(body.guests) ? Number(body.guests) : 0,
      extras: readExtras(body.extras),
    }
    const name = text(body.name, 100)
    const email = text(body.email, 200)
    const phone = text(body.phone, 40)
    const note = text(body.note, 2000)

    if (stay.sites < 1 || stay.sites > site.siteCount || stay.guests < 1)
      return json({ error: 'bad_stay', message: 'Please choose your sites and guests.' }, 400)
    if (!name || !emailPattern.test(email))
      return json({ error: 'bad_details', message: 'Please add your name and a working email.' }, 400)

    // The same checks and prices as the booking page, so the browser can't change them.
    const quote = quoteStay(stay, todayIso())
    if (!quote.ok) return json({ error: 'bad_stay', message: quote.message ?? 'Please pick your dates.' }, 400)
    const extras = pickedAddOns(stay)
    // How many of each rental exist; hookups are checked separately.
    const limits = Object.fromEntries(addOns.filter((a) => a.perNight && !a.hookup).map((a) => [a.name, a.perNight]))

    await reclaimStaleHolds(stay.arrive, stay.depart)

    let bookingId: string
    let error: Error | undefined
    try {
      const rows = await db().query(
        'select hold_booking($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15)::text as id',
        [
          stay.arrive, stay.depart, stay.sites, stay.guests, hookupsIn(stay),
          JSON.stringify(extras.map((p) => ({ name: p.addOn.name, price: p.addOn.price, qty: p.qty }))),
          quote.total * 100, name, email, phone || null, note || null,
          site.siteCount, site.hookupsPerNight, JSON.stringify(limits), HOLD_MINUTES,
        ],
      )
      bookingId = (rows[0] as { id: string }).id
    } catch (e) {
      error = e as Error
      bookingId = ''
    }
    const item = error?.message.match(/item_sold_out:(.+)/)?.[1]?.trim()
    if (item)
      return json({ error: 'item_sold_out', message: `There aren’t enough of the ${item.toLowerCase()} rental left on some of those nights. Take fewer, remove it, or try other dates.` }, 409)
    if (error?.message.includes('hookups_sold_out'))
      return json({ error: 'hookups_sold_out', message: 'Both electric hookups are taken on some of those nights. Remove the hookup or try other dates.' }, 409)
    if (error?.message.includes('sold_out'))
      return json({ error: 'sold_out', message: `There aren’t ${plural(stay.sites, 'free site')} on every one of those nights. Try fewer sites or other dates.` }, 409)
    if (error) throw error

    const dates = `${formatDay(stay.arrive)} to ${formatDay(stay.depart)}`
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: stay.sites * quote.nights,
        price_data: {
          currency: 'usd',
          unit_amount: site.pricePerSiteNight * 100,
          product_data: {
            name: 'Campsite night',
            description: `${plural(stay.sites, 'site')} × ${plural(quote.nights, 'night')}, ${dates}`,
            ...(env('STRIPE_TAX_CODE') ? { tax_code: env('STRIPE_TAX_CODE') } : {}),
          },
        },
      },
      ...extras.map(({ addOn, qty }) => ({
        quantity: qty,
        price_data: {
          currency: 'usd',
          unit_amount: addOn.price * 100,
          product_data: { name: addOn.kind === 'rental' ? `${addOn.name} (rental)` : addOn.name, description: addOn.note },
        },
      })),
    ]

    const base = origin(request)
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: email,
      client_reference_id: String(bookingId),
      metadata: { booking_id: String(bookingId) },
      payment_intent_data: {
        description: `${site.name}: ${dates}, ${plural(stay.sites, 'site')}`,
        metadata: { booking_id: String(bookingId) },
      },
      // Stripe Tax adds Michigan tax when it's switched on in Stripe and STRIPE_TAX=on.
      automatic_tax: { enabled: env('STRIPE_TAX') === 'on' },
      expires_at: Math.floor(Date.now() / 1000) + PAY_MINUTES * 60,
      success_url: `${base}/book/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/book?cancelled=${bookingId}`,
    })

    await db().query('update bookings set stripe_session_id = $1 where id = $2', [session.id, bookingId])
    return json({ url: session.url })
  })

// Holds on these nights whose 10 minutes are up but whose Stripe page may still
// be open. Close each page so it can't be paid, then free its sites. If the
// guest paid just before we got there, confirm their booking instead (the
// webhook would do the same moments later, and confirms only once).
const reclaimStaleHolds = async (arrive: string, depart: string) => {
  const rows = (await db().query(
    `select id::text, stripe_session_id from bookings
      where status = 'held' and hold_expires_at <= now() and stripe_session_id is not null
        and arrive < $2 and depart > $1`,
    [arrive, depart],
  )) as { id: string; stripe_session_id: string }[]

  for (const row of rows) {
    let session = await stripe().checkout.sessions.retrieve(row.stripe_session_id)
    if (session.status === 'open') {
      try {
        session = await stripe().checkout.sessions.expire(row.stripe_session_id)
      } catch {
        session = await stripe().checkout.sessions.retrieve(row.stripe_session_id)
      }
    }
    if (session.status === 'complete' && session.payment_status === 'paid') {
      const confirmed = await db().query(`select ${bookingColumns} from confirm_booking($1, $2)`, [row.id, session.id])
      const booking = confirmed[0] as BookingRow | undefined
      if (booking) await sendBookingEmails(booking, session.amount_total ?? booking.total_cents)
    } else if (session.status === 'expired') {
      await db().query('select expire_booking($1)', [row.id])
    } else {
      // Couldn't close the page; better to ask this guest to retry than risk a double booking.
      throw new Error(`stale hold ${row.id} still payable`)
    }
  }
}
