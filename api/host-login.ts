// POST /api/host-login  { password }  signs in to the host dashboard.
// DELETE /api/host-login               signs out.
// Five tries per visitor every 15 minutes, and 30 an hour across everyone.

import { rateLimited } from './_lib/rate-limit.js'
import { clearedCookie, hostPassword, passwordMatches, sessionCookie } from './_lib/host-auth.js'
import { handle, json } from './_lib/server.js'

const withCookie = (response: Response, cookie: string) => {
  response.headers.append('set-cookie', cookie)
  return response
}

export const POST = (request: Request) =>
  handle(async () => {
    if (!hostPassword()) {
      return json({ error: 'not_configured', message: 'Set HOST_PASSWORD (12+ characters) in Vercel to turn the dashboard on.' }, 503)
    }
    const limited =
      (await rateLimited(request, 'hostLogin', { failClosed: true })) ||
      (await rateLimited(request, 'hostLoginAll', { failClosed: true, everyone: true }))
    if (limited) return limited
    const { password } = (await request.json().catch(() => ({}))) as { password?: unknown }
    if (typeof password !== 'string' || !passwordMatches(password)) {
      return json({ error: 'wrong_password', message: 'That password isn’t right.' }, 401)
    }
    return withCookie(json({ ok: true }), sessionCookie())
  })

export const DELETE = () => withCookie(json({ ok: true }), clearedCookie())
