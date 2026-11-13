// Sign-in for the private host dashboard (/host).
// HOST_PASSWORD (a Vercel environment variable, at least 12 characters) is
// the password. Signing in sets a cookie holding an expiry time and a
// signature made from the password, so changing HOST_PASSWORD signs everyone out.

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { env } from './server.js'

const COOKIE = 'host_session'
const MAX_AGE_SECONDS = 14 * 24 * 60 * 60

export const hostPassword = () => {
  const p = env('HOST_PASSWORD')
  return p.length >= 12 ? p : ''
}

const sha256 = (s: string) => createHash('sha256').update(s).digest()

// Compares in constant time. Hashing first makes both sides the same length.
export const passwordMatches = (given: string) => {
  const expected = hostPassword()
  return !!expected && timingSafeEqual(sha256(given), sha256(expected))
}

const signature = (expires: string) =>
  createHmac('sha256', sha256(`host-session:${hostPassword()}`)).update(expires).digest('base64url')

export const sessionCookie = () => {
  const expires = String(Date.now() + MAX_AGE_SECONDS * 1000)
  return `${COOKIE}=${expires}.${signature(expires)}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`
}

export const clearedCookie = () => `${COOKIE}=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`

// True when the request carries a valid, unexpired host cookie.
export const isHost = (request: Request) => {
  if (!hostPassword()) return false
  const raw = (request.headers.get('cookie') ?? '')
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1)
  const [expires, sig] = (raw ?? '').split('.')
  if (!expires || !sig || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false
  const want = Buffer.from(signature(expires))
  const got = Buffer.from(sig)
  return want.length === got.length && timingSafeEqual(want, got)
}
