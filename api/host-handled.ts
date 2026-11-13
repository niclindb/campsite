// POST /api/host-handled  { sessionId }
// Marks a "payment not confirmed" alert as dealt with, so the dashboard stops
// showing it. Saved on the Stripe payment page's metadata (host_handled), so
// there's nothing to add to the database. Signed-in hosts only.

import { isHost } from './_lib/host-auth.js'
import { rateLimited } from './_lib/rate-limit.js'
import { handle, json, stripe } from './_lib/server.js'

export const POST = (request: Request) =>
  handle(async () => {
    if (!isHost(request)) return json({ error: 'signed_out', message: 'Please sign in again.' }, 401)
    const origin = request.headers.get('origin')
    if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'bad_origin' }, 403)
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'bad_request' }, 415)
    const limited = await rateLimited(request, 'hostBlock', { failClosed: true })
    if (limited) return limited

    const { sessionId } = (await request.json().catch(() => ({}))) as { sessionId?: unknown }
    if (typeof sessionId !== 'string' || !/^cs_[\w]{10,200}$/.test(sessionId)) {
      return json({ error: 'bad_request', message: 'Unknown payment.' }, 400)
    }
    const session = await stripe().checkout.sessions.retrieve(sessionId)
    await stripe().checkout.sessions.update(sessionId, {
      metadata: { ...session.metadata, host_handled: new Date().toISOString() },
    })
    return json({ ok: true })
  })
