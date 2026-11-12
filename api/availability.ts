// GET /api/availability?arrive=YYYY-MM-DD&depart=YYYY-MM-DD
// How many sites and electric hookups are free on each night of a stay.

import { site } from '../src/content/site.js'
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

    const { data, error } = await db().rpc('night_usage', { p_from: arrive, p_to: depart })
    if (error) throw error
    const nights = (data as { night: string; sites_used: number; hookups_used: number }[]).map((n) => ({
      night: String(n.night).slice(0, 10),
      sitesFree: Math.max(0, site.siteCount - n.sites_used),
      hookupsFree: Math.max(0, site.hookupsPerNight - n.hookups_used),
    }))
    return json({ nights })
  })
