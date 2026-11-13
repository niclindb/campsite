// Refunds for paid bookings, shared by the Stripe webhook and the host
// dashboard's refund button.

import type Stripe from 'stripe'
import { db, stripe } from './server.js'

// Saves the total refunded so far. A full refund also cancels the booking,
// which frees its nights.
export const recordRefund = async (bookingId: string, refundedCents: number, full: boolean) => {
  await db().query(
    `update bookings
        set refunded_cents = greatest(refunded_cents, $2),
            status = case when $3 and status = 'confirmed' then 'cancelled' else status end
      where id = $1`,
    [bookingId, refundedCents, full],
  )
}

// The booking's card payment: what was paid and what is already refunded.
export const paymentOf = async (sessionId: string) => {
  const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ['payment_intent.latest_charge'] })
  const intent = session.payment_intent as Stripe.PaymentIntent | null
  const charge = intent?.latest_charge as Stripe.Charge | null | undefined
  if (!intent || !charge || typeof charge === 'string') return null
  return { intentId: intent.id, paidCents: charge.amount_captured, refundedCents: charge.amount_refunded }
}
