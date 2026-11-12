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
