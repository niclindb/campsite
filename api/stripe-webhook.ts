// POST /api/stripe-webhook
// Stripe calls this when a payment page is paid or expires. A paid page
// confirms the booking and sends the emails; an expired one frees the sites.

import type Stripe from 'stripe'
import { db, env, handle, json, stripe, type BookingRow } from './_lib/server.js'
import { sendBookingEmails } from './_lib/email.js'

export const POST = (request: Request) =>
  handle(async () => {
    const signature = request.headers.get('stripe-signature')
    const secret = env('STRIPE_WEBHOOK_SECRET')
    if (!signature || !secret) return json({ error: 'unsigned' }, 400)

    let event: Stripe.Event
    try {
      event = await stripe().webhooks.constructEventAsync(await request.text(), signature, secret)
    } catch {
      return json({ error: 'bad_signature' }, 400)
    }

    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.booking_id
    if (!bookingId) return json({ received: true })

    if (
      (event.type === 'checkout.session.completed' && session.payment_status === 'paid') ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const { data, error } = await db().rpc('confirm_booking', { p_id: bookingId, p_session_id: session.id })
      if (error) throw error
      // Only the first delivery of this event confirms the booking and emails.
      const booking = (data as BookingRow[])[0]
      if (booking) await sendBookingEmails(booking, session.amount_total ?? booking.total_cents)
    }

    if (event.type === 'checkout.session.expired') {
      const { error } = await db().rpc('expire_booking', { p_id: bookingId })
      if (error) throw error
    }

    return json({ received: true })
  })
