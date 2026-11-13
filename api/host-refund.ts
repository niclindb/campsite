// POST /api/host-refund  { bookingId, amountCents, requestId }
// Refunds part or all of a paid booking from the host dashboard. A refund of
// everything that's left cancels the booking and frees its nights; a partial
// refund keeps the booking. Signed-in hosts only.

import { isHost } from './_lib/host-auth.js'
import { rateLimited } from './_lib/rate-limit.js'
import { paymentOf, recordRefund } from './_lib/refund.js'
import { db, handle, json, stripe } from './_lib/server.js'

export const POST = (request: Request) =>
  handle(async () => {
    if (!isHost(request)) return json({ error: 'signed_out', message: 'Please sign in again.' }, 401)
    // Only the dashboard itself may ask (the cookie is also SameSite=Strict).
    const origin = request.headers.get('origin')
    if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'bad_origin' }, 403)
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'bad_request' }, 415)
    const limited = await rateLimited(request, 'hostRefund', { failClosed: true })
    if (limited) return limited

    const { bookingId, amountCents, requestId } = (await request.json().catch(() => ({}))) as {
      bookingId?: unknown
      amountCents?: unknown
      requestId?: unknown
    }
    if (typeof bookingId !== 'string' || !/^[0-9a-f-]{36}$/.test(bookingId)) {
      return json({ error: 'bad_request', message: 'Unknown booking.' }, 400)
    }
    if (typeof requestId !== 'string' || !/^[\w-]{8,64}$/.test(requestId)) {
      return json({ error: 'bad_request', message: 'Please reload the page and try again.' }, 400)
    }
    if (typeof amountCents !== 'number' || !Number.isInteger(amountCents) || amountCents < 1) {
      return json({ error: 'bad_amount', message: 'Enter an amount of at least $0.01.' }, 400)
    }

    const rows = (await db().query('select status, stripe_session_id from bookings where id = $1', [bookingId])) as
      { status: string; stripe_session_id: string | null }[]
    const booking = rows[0]
    if (!booking) return json({ error: 'not_found', message: 'That booking wasn’t found.' }, 404)
    if (booking.status !== 'confirmed' || !booking.stripe_session_id) {
      return json({ error: 'not_paid', message: 'Only paid bookings can be refunded.' }, 409)
    }

    const payment = await paymentOf(booking.stripe_session_id)
    if (!payment) return json({ error: 'no_payment', message: 'Stripe has no card payment for this booking.' }, 409)
    const left = payment.paidCents - payment.refundedCents
    if (amountCents > left) {
      return json({ error: 'bad_amount', message: `Only $${(left / 100).toFixed(2)} is left to refund.` }, 400)
    }

    // The same requestId never refunds twice, even if the button is pressed again.
    await stripe().refunds.create(
      { payment_intent: payment.intentId, amount: amountCents, metadata: { booking_id: bookingId, source: 'host dashboard' } },
      { idempotencyKey: `host-refund:${bookingId}:${requestId}` },
    )
    const refundedCents = payment.refundedCents + amountCents
    const full = refundedCents >= payment.paidCents
    // Stripe's charge.refunded event records this too; saving it now shows it right away.
    await recordRefund(bookingId, refundedCents, full)
    return json({ ok: true, refundedCents, cancelled: full })
  })
