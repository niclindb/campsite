// Confirms a paid booking and emails the guest and hosts. If that fails, the
// hosts get one alert email for the booking and the error is thrown again,
// so Stripe retries until the problem is fixed.

import type Stripe from 'stripe'
import { site } from '../../src/content/site.js'
import { formatDay } from '../../src/content/booking.js'
import { bookingColumns, db, stripe, type BookingRow } from './server.js'
import { sendBookingEmails, sendFailureAlert, sendOverbookedAlert } from './email.js'

export const confirmPaid = async (bookingId: string, session: Stripe.Checkout.Session) => {
  try {
    // A hold that had already run out may have had its sites given away
    // before this payment landed; check after confirming.
    const before = (await db().query('select status from bookings where id = $1', [bookingId]))[0] as { status: string } | undefined
    const rows = await db().query(`select ${bookingColumns} from confirm_booking($1, $2)`, [bookingId, session.id])
    // Only the first call for a booking confirms it and sends the emails.
    const booking = rows[0] as BookingRow | undefined
    if (booking) {
      await sendBookingEmails(booking, session.amount_total ?? booking.total_cents)
      if (before?.status === 'expired') await checkOverbooked(booking)
    }
  } catch (error) {
    await alertOnce(bookingId, session, error).catch((e) => console.error('Failure alert skipped:', e))
    throw error
  }
}

// Stripe retries many times, so the alert is marked on the payment page's
// metadata and sent only the first time.
const alertOnce = async (bookingId: string, session: Stripe.Checkout.Session, error: unknown) => {
  const fresh = await stripe().checkout.sessions.retrieve(session.id)
  if (fresh.metadata?.failure_alerted) return
  await stripe().checkout.sessions.update(session.id, { metadata: { ...fresh.metadata, failure_alerted: new Date().toISOString() } })
  await sendFailureAlert({
    bookingId,
    sessionId: session.id,
    guestName: fresh.customer_details?.name ?? null,
    guestEmail: fresh.customer_details?.email ?? fresh.customer_email ?? null,
    paidCents: fresh.amount_total,
    dates: await datesOf(bookingId),
    error,
  })
}

// The stay's dates, if the database can still be read.
const datesOf = async (bookingId: string) => {
  try {
    const rows = (await db().query('select arrive::text, depart::text, sites from bookings where id = $1', [bookingId])) as
      { arrive: string; depart: string; sites: number }[]
    const b = rows[0]
    return b ? `${formatDay(b.arrive)} to ${formatDay(b.depart)}, ${b.sites} site${b.sites === 1 ? '' : 's'}` : null
  } catch {
    return null
  }
}

// Emails the hosts if confirming a late payment put more sites in use than
// the camp has on any night, so they can sort it out with the guests.
const checkOverbooked = async (b: BookingRow) => {
  try {
    const rows = (await db().query('select night::text from night_usage($1, $2) where sites_used > $3', [b.arrive, b.depart, site.siteCount])) as { night: string }[]
    if (rows.length) await sendOverbookedAlert(b, rows.map((r) => formatDay(String(r.night).slice(0, 10))))
  } catch (e) {
    console.error('Overbooking check failed:', e)
  }
}
