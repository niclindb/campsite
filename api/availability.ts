// GET /api/availability?arrive=YYYY-MM-DD&depart=YYYY-MM-DD
// How many sites and electric hookups are free on each night of a stay, and
// how many of each rental is free on every night.

import { addOns, site } from '../src/content/site.js'
import { nightsBetween } from '../src/content/booking.js'
import { db, handle, json } from './_lib/server.js'

const isDate = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)

export const GET = (request: Request) =>
  handle(async () => {
    const q = new URL(request.url).searchParams
    const arrive = q.get('arrive')
    const depart = q.get('depart')
    if (!isDate(arrive) || !isDate(depart) || depart <= arrive || nightsBetween(arrive, depart) > 60) {
      return json({ error: 'bad_dates', message: 'Please pick an arrival and a later departure.' }, 400)
    }

    const [rows, used] = await Promise.all([
      db().query('select night::text, sites_used, hookups_used from night_usage($1, $2)', [arrive, depart]),
      db().query('select item, max(used)::int as used from item_usage($1, $2) group by item', [arrive, depart]),
    ])
    const usedOf = (name: string) => (used as { item: string; used: number }[]).find((u) => u.item === name)?.used ?? 0
    // Rentals free on every night (their busiest night). Hookups are counted per night below.
    const items = Object.fromEntries(
      addOns.filter((a) => a.perNight && !a.hookup).map((a) => [a.name, Math.max(0, (a.perNight ?? 0) - usedOf(a.name))]),
    )
    const nights = (rows as { night: string; sites_used: number; hookups_used: number }[]).map((n) => ({
      night: String(n.night).slice(0, 10),
      sitesFree: Math.max(0, site.siteCount - n.sites_used),
      hookupsFree: Math.max(0, site.hookupsPerNight - n.hookups_used),
    }))
    return json({ nights, items })
  })
