// POST /api/cancel-hold  { bookingId }
// When a guest backs out of the Stripe page, free their held sites right away
// instead of waiting for the hold to run out.

import { db, handle, json, stripe } from './_lib/server.js'

export const POST = (request: Request) =>
  handle(async () => {
    const { bookingId } = (await request.json().catch(() => ({}))) as { bookingId?: string }
    if (!bookingId || !/^[0-9a-f-]{36}$/.test(bookingId)) return json({ ok: false }, 400)

    const { data } = await db().from('bookings').select('status, stripe_session_id').eq('id', bookingId).maybeSingle()
    const row = data as { status: string; stripe_session_id: string | null } | null
    if (!row || row.status !== 'held') return json({ ok: true })

    // Close the payment page first, so it can't be paid after the sites are freed.
    if (row.stripe_session_id) {
      const session = await stripe().checkout.sessions.retrieve(row.stripe_session_id)
      if (session.status !== 'open') return json({ ok: true })
      await stripe().checkout.sessions.expire(row.stripe_session_id)
    }
    await db().rpc('expire_booking', { p_id: bookingId })
    return json({ ok: true })
  })
