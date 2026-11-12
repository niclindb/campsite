// GET /api/booking-status?session_id=cs_...
// What the confirmation page shows after Stripe sends the guest back.
// The Stripe session id is long and random, so only the guest has it.

import { pickedLabel } from '../src/content/booking.js'
import { db, handle, json, type BookingRow } from './_lib/server.js'

export const GET = (request: Request) =>
  handle(async () => {
    const sessionId = new URL(request.url).searchParams.get('session_id') ?? ''
    if (!/^cs_[A-Za-z0-9_]{10,}$/.test(sessionId)) return json({ error: 'not_found' }, 404)

    const rows = await db().query(
      'select status, arrive::text, depart::text, sites, guests, extras, total_cents, tax_cents, name from bookings where stripe_session_id = $1',
      [sessionId],
    )
    if (!rows[0]) return json({ error: 'not_found' }, 404)
    const b = rows[0] as Pick<BookingRow, 'status' | 'arrive' | 'depart' | 'sites' | 'guests' | 'extras' | 'total_cents' | 'tax_cents' | 'name'>
    return json({
      status: b.status,
      arrive: b.arrive,
      depart: b.depart,
      sites: b.sites,
      guests: b.guests,
      extras: b.extras.map((x) => pickedLabel(x.name, x.qty ?? 1)),
      total: b.total_cents / 100,
      tax: b.tax_cents / 100,
      firstName: b.name.split(' ')[0],
    })
  })
