// GET /api/booking-status?session_id=cs_...
// What the confirmation page shows after Stripe sends the guest back.
// The Stripe session id is long and random, so only the guest has it.

import { db, handle, json, type BookingRow } from './_lib/server.js'

export const GET = (request: Request) =>
  handle(async () => {
    const sessionId = new URL(request.url).searchParams.get('session_id') ?? ''
    if (!/^cs_[A-Za-z0-9_]{10,}$/.test(sessionId)) return json({ error: 'not_found' }, 404)

    const { data, error } = await db()
      .from('bookings')
      .select('status, arrive, depart, sites, guests, extras, total_cents, name')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()
    if (error) throw error
    if (!data) return json({ error: 'not_found' }, 404)
    const b = data as Pick<BookingRow, 'status' | 'arrive' | 'depart' | 'sites' | 'guests' | 'extras' | 'total_cents' | 'name'>
    return json({
      status: b.status,
      arrive: b.arrive,
      depart: b.depart,
      sites: b.sites,
      guests: b.guests,
      extras: b.extras.map((x) => x.name),
      total: b.total_cents / 100,
      firstName: b.name.split(' ')[0],
    })
  })
