// Booking emails, sent from the hosts' Gmail account with a Google app password.
// BOOKING_EMAIL_FROM: the Gmail address. GMAIL_APP_PASSWORD: its app password.
// BOOKING_ALERTS_TO: who gets new-booking alerts (defaults to the sender).
// BOOKING_DIRECTIONS: the private arrival directions sent to guests.

import nodemailer from 'nodemailer'
import { site } from '../../src/content/site.js'
import { formatDay, nightsBetween, pickedLabel } from '../../src/content/booking.js'
import { env, type BookingRow } from './server.js'

const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0 })}`
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

const summary = (b: BookingRow, paidCents: number) => {
  const nights = nightsBetween(b.arrive, b.depart)
  return [
    `Dates: ${formatDay(b.arrive)} to ${formatDay(b.depart)} (${plural(nights, 'night')})`,
    `Sites: ${b.sites}`,
    `Guests: ${b.guests}`,
    `Extras: ${b.extras.length ? b.extras.map((x) => `${pickedLabel(x.name, x.qty ?? 1)} ($${x.price * (x.qty ?? 1)})`).join(', ') : 'None'}`,
    ...(b.tax_cents > 0 ? [`Sales tax: ${money(b.tax_cents)}`] : []),
    `Paid: ${money(paidCents)}${b.tax_cents > 0 ? ' (tax included)' : ''}`,
  ]
}

export const sendBookingEmails = async (b: BookingRow, paidCents: number) => {
  const from = env('BOOKING_EMAIL_FROM')
  const pass = env('GMAIL_APP_PASSWORD')
  if (!from || !pass) {
    console.error('Booking emails not sent: BOOKING_EMAIL_FROM or GMAIL_APP_PASSWORD is missing.')
    return
  }
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: from, pass } })
  const sender = `"${site.name}" <${from}>`
  const lines = summary(b, paidCents)
  const directions = env('BOOKING_DIRECTIONS') || 'We’ll send exact directions to camp before your stay.'

  const guest = [
    `Hi ${b.name},`,
    '',
    `You're booked at ${site.name}. Thank you!`,
    '',
    ...lines,
    '',
    `Check-in: ${site.checkIn}`,
    `Check-out: ${site.checkOut}`,
    '',
    'Getting here:',
    directions,
    '',
    'Questions? Just reply to this email.',
    '',
    `${site.hosts}`,
  ].join('\n')

  const host = [
    `New booking from ${b.name}`,
    '',
    ...lines,
    `Email: ${b.email}`,
    `Phone: ${b.phone || 'Not given'}`,
    `Note: ${b.note || 'None'}`,
    '',
    `Booking id: ${b.id}`,
  ].join('\n')

  // A failed email must not undo a paid booking, so errors are only logged.
  const results = await Promise.allSettled([
    transport.sendMail({ from: sender, to: b.email, replyTo: from, subject: `Your stay at ${site.name}: ${formatDay(b.arrive)} to ${formatDay(b.depart)}`, text: guest }),
    transport.sendMail({ from: sender, to: env('BOOKING_ALERTS_TO') || from, replyTo: b.email, subject: `New booking: ${formatDay(b.arrive)} to ${formatDay(b.depart)}, ${plural(b.sites, 'site')}`, text: host }),
  ])
  results.forEach((r) => r.status === 'rejected' && console.error('Booking email failed:', r.reason))
}

// Tells the hosts that a guest paid but their booking couldn't be confirmed
// (say, the database is down or out of date). Stripe keeps retrying, and the
// booking confirms itself once the problem is fixed, but the guest gets no
// email until then. Never throws.
export type FailedPayment = {
  bookingId: string
  sessionId: string
  guestName: string | null
  guestEmail: string | null
  paidCents: number | null
  dates: string | null
  error: unknown
}

export const sendFailureAlert = async (f: FailedPayment) => {
  const from = env('BOOKING_EMAIL_FROM')
  const pass = env('GMAIL_APP_PASSWORD')
  if (!from || !pass) return
  const reason = f.error instanceof Error ? f.error.message : String(f.error)
  const text = [
    'A guest paid, but their booking could not be confirmed, so they have not had a confirmation email yet.',
    '',
    `Guest: ${f.guestName || 'Unknown'} (${f.guestEmail || 'no email'})`,
    `Dates: ${f.dates || 'Unknown'}`,
    `Paid: ${f.paidCents == null ? 'Unknown' : money(f.paidCents)}`,
    `Booking id: ${f.bookingId}`,
    `Stripe payment page: ${f.sessionId}`,
    '',
    `Error: ${reason}`,
    '',
    'Their nights stay reserved for them. Stripe retries for up to 3 days, and the',
    'booking confirms and emails the guest as soon as the problem is fixed.',
    'If the error mentions a missing column or function, run db/schema.sql in the',
    'Neon SQL Editor, then press Resend on the failed event in Stripe',
    '(Developers -> Webhooks).',
  ].join('\n')
  try {
    const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: from, pass } })
    await transport.sendMail({
      from: `"${site.name}" <${from}>`,
      to: env('BOOKING_ALERTS_TO') || from,
      replyTo: f.guestEmail || from,
      subject: `Action needed: paid booking not confirmed (${f.guestName || 'guest'})`,
      text,
    })
  } catch (e) {
    console.error('Failure alert email failed:', e)
  }
}
