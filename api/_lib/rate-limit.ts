// Limits how often one visitor (by IP address) can call a booking server
// function, so nobody can hold every site over and over or hammer the
// database. Counts live in the rate_limits table (db/schema.sql).

import { db, json } from './server.js'

// Requests allowed per visitor in each window.
export const limits = {
  checkout: { max: 6, windowSeconds: 10 * 60 },
  availability: { max: 60, windowSeconds: 60 },
  cancelHold: { max: 20, windowSeconds: 10 * 60 },
  bookingStatus: { max: 30, windowSeconds: 60 },
  view: { max: 120, windowSeconds: 60 },
  // Host dashboard sign-in, per visitor and across everyone together.
  hostLogin: { max: 5, windowSeconds: 15 * 60 },
  hostLoginAll: { max: 30, windowSeconds: 60 * 60 },
} as const

// Vercel sets x-real-ip to the visitor's address; x-forwarded-for is the fallback.
export const visitorIp = (request: Request) =>
  request.headers.get('x-real-ip')?.trim() ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  'unknown'

// Returns a 429 response when the visitor is over the limit, otherwise null.
// If the check itself fails (say, db/schema.sql hasn't been re-run yet), the
// request goes through, so booking never breaks because of the limiter.
// `failClosed` turns that around (used for the host sign-in), and `everyone`
// counts all visitors together instead of each one.
export const rateLimited = async (
  request: Request,
  action: keyof typeof limits,
  { failClosed = false, everyone = false } = {},
) => {
  const { max, windowSeconds } = limits[action]
  try {
    const key = everyone ? `${action}:all` : `${action}:${visitorIp(request)}`
    const rows = await db().query('select hit_rate_limit($1, $2, $3) as ok', [key, max, windowSeconds])
    if ((rows[0] as { ok: boolean } | undefined)?.ok !== false) return null
  } catch (e) {
    console.error('Rate limit check failed:', e instanceof Error ? e.message : e)
    if (!failClosed) return null
    return json({ error: 'unavailable', message: 'Sign-in is unavailable right now. Please try again later.' }, 503)
  }
  return json({ error: 'rate_limited', message: 'Too many tries in a short time. Please wait a few minutes and try again.' }, 429)
}
