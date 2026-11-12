// Shared helpers for the booking server functions in api/.
// Settings come from Vercel environment variables (see BOOKING_SETUP.md).

import Stripe from 'stripe'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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

let dbClient: SupabaseClient | undefined
export const db = () => {
  need('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')
  dbClient ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return dbClient
}

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
