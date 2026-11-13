// POST /api/stripe-webhook
// Stripe calls this when a payment page is paid or expires, and when a
// payment is refunded. A paid page confirms the booking and sends the emails;
// an expired one frees the sites; a full refund cancels the booking and frees
// its sites too.

import type Stripe from 'stripe'
import { db, env, handle, json, stripe } from './_lib/server.js'
import { confirmPaid } from './_lib/confirm.js'
import { recordRefund } from './_lib/refund.js'

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

    if (event.type === 'charge.refunded') {
      await cancelRefunded(event.data.object)
      return json({ received: true })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.booking_id
    if (!bookingId) return json({ received: true })

    if (
      (event.type === 'checkout.session.completed' && session.payment_status === 'paid') ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      // Only the first delivery of this event confirms the booking and emails.
      // If it fails, the hosts are emailed once and Stripe retries.
      await confirmPaid(bookingId, session)
    }

    // A delayed payment that failed (only possible if delayed methods are ever
    // turned on) frees the sites like an expired page.
    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      await db().query('select expire_booking($1)', [bookingId])
    }

    return json({ received: true })
  })

// Records how much of the payment has been refunded. Stripe sets `refunded`
// only once the whole charge is refunded, so a partial refund (say, half)
// keeps the booking, while a full refund cancels it and frees its nights.
// The booking id rides on the payment's metadata, set when the payment page was made.
const cancelRefunded = async (charge: Stripe.Charge) => {
  if (!charge.payment_intent) return
  const intent =
    typeof charge.payment_intent === 'string'
      ? await stripe().paymentIntents.retrieve(charge.payment_intent)
      : charge.payment_intent
  const bookingId = intent.metadata?.booking_id
  if (!bookingId || !/^[0-9a-f-]{36}$/.test(bookingId)) return
  await recordRefund(bookingId, charge.amount_refunded, charge.refunded)
}
