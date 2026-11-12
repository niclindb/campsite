// GET /api/host-data?month=YYYY-MM&days=30
// Everything the host dashboard shows, for signed-in hosts only:
// bookings, how full each night of the month is, and page views.

import { addOns, site } from '../src/content/site.js'
import { addDays, todayIso } from '../src/content/booking.js'
import { isHost } from './_lib/host-auth.js'
import { db, handle, json } from './_lib/server.js'

const noindex = (response: Response) => {
  response.headers.set('x-robots-tag', 'noindex, nofollow')
  return response
}

export const GET = (request: Request) =>
  handle(async () => {
    if (!isHost(request)) return noindex(json({ error: 'signed_out' }, 401))

    const q = new URL(request.url).searchParams
    const today = todayIso()
    const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(q.get('month') ?? '') ? q.get('month')! : today.slice(0, 7)
    const from = `${month}-01`
    const [y, m] = month.split('-').map(Number)
    const to = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)
    const days = Math.min(Math.max(Number(q.get('days')) || 30, 7), 365)
    const viewsFrom = addDays(today, 1 - days)

    const [bookings, nights, items, blocked, views, sources] = await Promise.all([
      // Paid and cancelled bookings, plus holds still waiting on payment.
      // Unpaid holds that ran out are left out.
      db().query(
        `select id::text, status, arrive::text, depart::text, sites, guests, hookups, extras,
                total_cents, tax_cents, name, email, phone, note,
                created_at, paid_at, hold_expires_at
           from bookings
          where status in ('confirmed', 'cancelled')
             or (status = 'held' and hold_expires_at > now())
          order by arrive, created_at
          limit 2000`,
      ),
      db().query('select night::text, sites_used, hookups_used from night_usage($1, $2)', [from, to]),
      db().query('select night::text, item, used from item_usage($1, $2)', [from, to]),
      db().query('select night::text, sites, note from blocked_nights where night >= $1 and night < $2', [from, to]),
      db().query('select day::text, path, views, visits from page_views where day >= $1 order by day', [viewsFrom]),
      db().query(
        'select source, sum(visits)::int as visits from visit_sources where day >= $1 group by source order by visits desc limit 15',
        [viewsFrom],
      ),
    ])

    const day = (s: unknown) => String(s).slice(0, 10)
    return noindex(
      json({
        today,
        month,
        siteCount: site.siteCount,
        // Gear with a fixed number on hand, e.g. { Canoe: 3 }.
        limits: Object.fromEntries(addOns.filter((a) => a.perNight).map((a) => [a.name, a.perNight])),
        bookings,
        nights: (nights as { night: string; sites_used: number; hookups_used: number }[]).map((n) => ({
          night: day(n.night),
          sitesUsed: n.sites_used,
          hookupsUsed: n.hookups_used,
        })),
        items: (items as { night: string; item: string; used: number }[]).map((i) => ({ night: day(i.night), item: i.item, used: i.used })),
        blocked: (blocked as { night: string; sites: number; note: string | null }[]).map((b) => ({ ...b, night: day(b.night) })),
        views: {
          from: viewsFrom,
          days,
          rows: (views as { day: string; path: string; views: number; visits: number }[]).map((v) => ({ ...v, day: day(v.day) })),
          sources,
        },
      }),
    )
  })
