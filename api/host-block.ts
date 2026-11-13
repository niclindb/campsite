// POST /api/host-block  { action: 'block', from, through, sites, note }
//                       { action: 'unblock', from, through }
// Closes sites on a run of nights (say, sold on Hipcamp or a family weekend),
// or opens them again. `through` is the last night, included. Blocked sites
// count as taken, so guests can't book them. Signed-in hosts only.

import { site } from '../src/content/site.js'
import { addDays, nightsBetween } from '../src/content/booking.js'
import { isHost } from './_lib/host-auth.js'
import { rateLimited } from './_lib/rate-limit.js'
import { db, handle, json } from './_lib/server.js'

const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))
const MAX_NIGHTS = 366

export const POST = (request: Request) =>
  handle(async () => {
    if (!isHost(request)) return json({ error: 'signed_out', message: 'Please sign in again.' }, 401)
    const origin = request.headers.get('origin')
    if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'bad_origin' }, 403)
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'bad_request' }, 415)
    const limited = await rateLimited(request, 'hostBlock', { failClosed: true })
    if (limited) return limited

    const body = (await request.json().catch(() => ({}))) as { action?: unknown; from?: unknown; through?: unknown; sites?: unknown; note?: unknown }
    const { from, through } = body
    if (!isDate(from) || !isDate(through) || through < from) {
      return json({ error: 'bad_dates', message: 'Pick a first night and a last night on or after it.' }, 400)
    }
    if (nightsBetween(from, through) + 1 > MAX_NIGHTS) {
      return json({ error: 'bad_dates', message: `Block at most ${MAX_NIGHTS} nights at a time.` }, 400)
    }
    const end = addDays(through, 1)

    if (body.action === 'unblock') {
      const rows = await db().query('delete from blocked_nights where night >= $1 and night < $2 returning night', [from, end])
      return json({ ok: true, nights: rows.length })
    }
    if (body.action !== 'block') return json({ error: 'bad_request' }, 400)

    const sites = body.sites
    if (typeof sites !== 'number' || !Number.isInteger(sites) || sites < 1 || sites > site.siteCount) {
      return json({ error: 'bad_sites', message: `Block between 1 and ${site.siteCount} sites.` }, 400)
    }
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) || null : null
    const rows = await db().query(
      `insert into blocked_nights (night, sites, note)
       select d::date, $3, $4 from generate_series($1::date, $2::date - 1, interval '1 day') as d
       on conflict (night) do update set sites = excluded.sites, note = excluded.note
       returning night`,
      [from, end, sites, note],
    )
    return json({ ok: true, nights: rows.length })
  })
