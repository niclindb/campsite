// POST /api/view  { path, from? }
// Counts one page view for the host dashboard. Nothing about the visitor is
// stored: only the page, the day, and (for arrivals from another website)
// that website's name. `from` is sent only on the first page of a visit.

import { todayIso } from '../src/content/booking.js'
import { isHost } from './_lib/host-auth.js'
import { rateLimited } from './_lib/rate-limit.js'
import { db, env, handle } from './_lib/server.js'

// The site's pages. Anything else is counted as "not found".
const pages = ['/', '/book', '/book/confirmed', '/info', '/privacy', '/terms']
const bots = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|java\/|go-http/i

const done = () => new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } })

// "https://www.google.com/search?..." -> "google.com"; our own site and junk -> null.
const sourceName = (from: string, ownHost: string) => {
  if (from === 'direct') return 'direct'
  try {
    const host = new URL(from).hostname.replace(/^www\./, '').toLowerCase()
    if (!host || host === ownHost || !/^[a-z0-9.-]{1,100}$/.test(host)) return null
    return host
  } catch {
    return null
  }
}

export const POST = (request: Request) =>
  handle(async () => {
    // Only the live site counts, and never the hosts themselves.
    if (env('VERCEL_ENV') !== 'production' || isHost(request)) return done()
    if (bots.test(request.headers.get('user-agent') ?? '')) return done()
    if (await rateLimited(request, 'view')) return done()

    const body = (await request.json().catch(() => ({}))) as { path?: unknown; from?: unknown }
    if (typeof body.path !== 'string') return done()
    const clean = body.path.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
    const path = pages.includes(clean) ? clean : 'not found'
    const ownHost = new URL(request.url).hostname.replace(/^www\./, '')
    const source = typeof body.from === 'string' ? sourceName(body.from, ownHost) : null

    await db().query('select record_page_view($1, $2, $3)', [todayIso(), path, source])
    return done()
  })
