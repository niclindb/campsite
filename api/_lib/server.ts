// Shared helpers for the booking server functions in api/.
// Settings come from Vercel environment variables (see BOOKING_SETUP.md).

import Stripe from 'stripe'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

export const env = (name: string) => process.env[name]?.trim() || ''

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

// A clear error when a setting is missing, instead of a crash.
export class NotConfigured extends Error {}

const need = (...names: string[]) => {
  const missing = names.filter((n) => !env(n))
  if (missing.length) throw new NotConfigured(`Missing settings: ${missing.join(', ')}`)
}

let stripeClient: Stripe | undefined
export const stripe = () => {
  need('STRIPE_SECRET_KEY')
  stripeClient ??= new Stripe(env('STRIPE_SECRET_KEY'))
  return stripeClient
}

// The Neon database. Vercel's Neon integration sets DATABASE_URL, or
// NEON_DATABASE_URL when it was connected with the NEON_ prefix.
// Each query runs on its own, so anything that must be checked and changed
// together lives in one SQL function in db/schema.sql.
let dbClient: NeonQueryFunction<false, false> | undefined
export const db = () => {
  const url = env('DATABASE_URL') || env('NEON_DATABASE_URL') || env('POSTGRES_URL')
  if (!url) throw new NotConfigured('Missing settings: DATABASE_URL')
  dbClient ??= neon(url)
  return dbClient
}

// Booking columns with dates as plain YYYY-MM-DD text.
export const bookingColumns =
  'id::text, status, arrive::text, depart::text, sites, guests, hookups, extras, total_cents, name, email, phone, note, stripe_session_id'

// Turns any thrown error into a response the booking page can show.
export const handle = async (fn: () => Promise<Response>) => {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof NotConfigured) {
      console.error(e.message)
      return json({ error: 'not_configured', message: 'Online booking isn’t switched on yet.' }, 503)
    }
    console.error(e)
    return json({ error: 'server_error', message: 'Something went wrong on our side. Please try again.' }, 500)
  }
}

// The site's own address, for Stripe's return links.
export const origin = (request: Request) => {
  const fixed = env('SITE_URL')
  if (fixed) return fixed.replace(/\/$/, '')
  const url = new URL(request.url)
  const host = request.headers.get('x-forwarded-host') ?? url.host
  const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')
  return `${proto}://${host}`
}

export type BookingRow = {
  id: string
  status: string
  arrive: string
  depart: string
  sites: number
  guests: number
  hookups: number
  extras: { name: string; price: number }[]
  total_cents: number
  name: string
  email: string
  phone: string | null
  note: string | null
  stripe_session_id: string | null
}
