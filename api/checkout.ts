// POST /api/checkout
// Checks the stay, holds the sites, and opens a Stripe payment page.
// The booking is confirmed by the Stripe webhook once payment succeeds.

import type Stripe from 'stripe'
import { addOns, site } from '../src/content/site.js'
import { formatDay, hookupsIn, pickedAddOns, quoteStay, todayIso, type Stay } from '../src/content/booking.js'
import { db, env, handle, json, origin, stripe } from './_lib/server.js'

// Stripe payment pages must stay open at least 30 minutes; the hold lasts a
// little longer so a guest who pays at the last moment still has their sites.
const PAY_MINUTES = 31
const HOLD_MINUTES = 35

type Body = Partial<Stay> & { name?: string; email?: string; phone?: string; note?: string }

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export const POST = (request: Request) =>
  handle(async () => {
    const body = (await request.json().catch(() => ({}))) as Body
    const stay: Stay = {
      arrive: text(body.arrive, 10),
      depart: text(body.depart, 10),
      sites: Number.isInteger(body.sites) ? Number(body.sites) : 0,
      guests: Number.isInteger(body.guests) ? Number(body.guests) : 0,
      extras: Array.isArray(body.extras) ? body.extras.filter((x) => addOns.some((a) => a.name === x)) : [],
    }
    const name = text(body.name, 100)
    const email = text(body.email, 200)
    const phone = text(body.phone, 40)
    const note = text(body.note, 2000)

    if (stay.sites < 1 || stay.sites > site.siteCount || stay.guests < 1)
      return json({ error: 'bad_stay', message: 'Please choose your sites and guests.' }, 400)
    if (!name || !emailPattern.test(email))
      return json({ error: 'bad_details', message: 'Please add your name and a working email.' }, 400)

    // The same checks and prices as the booking page, so the browser can't change them.
    const quote = quoteStay(stay, todayIso())
    if (!quote.ok) return json({ error: 'bad_stay', message: quote.message ?? 'Please pick your dates.' }, 400)
    const extras = pickedAddOns(stay)

    const { data: bookingId, error } = await db().rpc('hold_booking', {
      p_arrive: stay.arrive,
      p_depart: stay.depart,
      p_sites: stay.sites,
      p_guests: stay.guests,
      p_hookups: hookupsIn(stay),
      p_extras: extras.map((a) => ({ name: a.name, price: a.price })),
      p_total_cents: quote.total * 100,
      p_name: name,
      p_email: email,
      p_phone: phone || null,
      p_note: note || null,
      p_capacity: site.siteCount,
      p_hookup_capacity: site.hookupsPerNight,
      p_hold_minutes: HOLD_MINUTES,
    })
    if (error?.message.includes('hookups_sold_out'))
      return json({ error: 'hookups_sold_out', message: 'Both electric hookups are taken on some of those nights. Remove the hookup or try other dates.' }, 409)
    if (error?.message.includes('sold_out'))
      return json({ error: 'sold_out', message: `There aren’t ${plural(stay.sites, 'free site')} on every one of those nights. Try fewer sites or other dates.` }, 409)
    if (error) throw error

    const dates = `${formatDay(stay.arrive)} to ${formatDay(stay.depart)}`
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: stay.sites * quote.nights,
        price_data: {
          currency: 'usd',
          unit_amount: site.pricePerSiteNight * 100,
          product_data: {
            name: 'Campsite night',
            description: `${plural(stay.sites, 'site')} × ${plural(quote.nights, 'night')}, ${dates}`,
            ...(env('STRIPE_TAX_CODE') ? { tax_code: env('STRIPE_TAX_CODE') } : {}),
          },
        },
      },
      ...extras.map((a) => ({
        quantity: 1,
        price_data: { currency: 'usd', unit_amount: a.price * 100, product_data: { name: a.name, description: a.note } },
      })),
    ]

    const base = origin(request)
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: email,
      client_reference_id: String(bookingId),
      metadata: { booking_id: String(bookingId) },
      payment_intent_data: {
        description: `${site.name}: ${dates}, ${plural(stay.sites, 'site')}`,
        metadata: { booking_id: String(bookingId) },
      },
      // Stripe Tax adds Michigan tax when it's switched on in Stripe and STRIPE_TAX=on.
      automatic_tax: { enabled: env('STRIPE_TAX') === 'on' },
      expires_at: Math.floor(Date.now() / 1000) + PAY_MINUTES * 60,
      success_url: `${base}/book/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/book?cancelled=${bookingId}`,
    })

    await db().from('bookings').update({ stripe_session_id: session.id }).eq('id', bookingId)
    return json({ url: session.url })
  })
