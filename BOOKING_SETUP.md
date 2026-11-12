# Turning on instant booking

The booking page works in two modes:

- **Booking requests** (the default): the form emails the request to the hosts through Formspree, and they confirm by hand.
- **Instant booking**: guests see live availability, pay in full on Stripe, and are confirmed right away. This needs the setup below.

Do the steps in order. Use Stripe **test mode** first, then switch to live keys at the end.

## 1. Neon (the bookings database)

1. In Vercel, open **northern_oasis → Storage → Create Database → Neon**, pick the free plan, and connect it to the project with **Production** and **Preview** both ticked. This adds `DATABASE_URL` (or `NEON_DATABASE_URL`) for you. Leave optional extras such as Auth off.
2. Open the database in the Neon console (Vercel's **Open in Neon** button), go to **SQL Editor**, paste all of [`db/schema.sql`](db/schema.sql), and press **Run**.
   Run it again whenever `db/schema.sql` changes (it is safe to re-run). The rental limits update (November 2026) needs this before it goes live, and so does the rate limit update (the `rate_limits` table; until it exists, requests simply aren't limited).
3. Bookings then show up in **Tables → bookings**. To close nights by hand (for example sites sold on Hipcamp), add rows to **blocked_nights**: the date, and how many of the 5 sites are taken.

Neon's free plan sleeps when idle and wakes on the next request in under a second, so nothing needs to keep it awake.

## 2. Stripe (payments)

1. In the Stripe dashboard, turn on **Test mode**.
2. Open **Developers → API keys** and copy the **Secret key** (`sk_test_...`).
3. Open **Developers → Webhooks → Add endpoint**:
   - Endpoint URL: `https://<your site>/api/stripe-webhook`. Vercel's login wall (Deployment Protection) blocks Stripe on preview addresses, so for testing create a secret in **Vercel → Settings → Deployment Protection → Protection Bypass for Automation** and use `https://<preview address>/api/stripe-webhook?x-vercel-protection-bypass=<that secret>`.
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `charge.refunded`
   - Then copy the endpoint's **Signing secret** (`whsec_...`).

## 3. Gmail (booking emails)

1. Turn on **2-Step Verification** for the Google account at <https://myaccount.google.com/security>.
2. Create an **app password** at <https://myaccount.google.com/apppasswords>, and copy the 16 letters.

## 4. Vercel settings

Add these in **Vercel → northern_oasis → Settings → Environment Variables**, then redeploy. Tick **Preview** as well as Production while testing, since the test booking runs on a preview address. Set `VITE_INSTANT_BOOKING` for **Preview only** until the test booking passes, so the live site keeps taking requests.

| Name | Value |
| --- | --- |
| `STRIPE_SECRET_KEY` | The Stripe secret key (`sk_test_...`, later `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | The webhook signing secret (`whsec_...`) |
| `BOOKING_EMAIL_FROM` | The Gmail address the emails come from |
| `GMAIL_APP_PASSWORD` | The Gmail app password |
| `BOOKING_ALERTS_TO` | Where new-booking alerts go (optional; defaults to the sender) |
| `BOOKING_DIRECTIONS` | The exact arrival directions emailed to guests (kept private, never shown on the site) |
| `VITE_INSTANT_BOOKING` | `on`, to switch the page to instant booking |
| `SITE_URL` | The site's address, e.g. `https://northernoasis.com` (optional; otherwise taken from each request) |
| `HOST_PASSWORD` | The password for the private host dashboard at `/host`, at least 12 characters. Changing it signs everyone out. |

The repository is public, so none of these go in the code.

## 5. Test it

1. Book a stay on the preview site and pay with Stripe's test card `4242 4242 4242 4242` (any future date, any CVC).
2. Check that you land on the "You're booked" page, both emails arrive, and the booking shows as `confirmed` in Neon.
3. Start another booking and press back on the Stripe page. The held sites should be released (status `expired`).
4. Refund the first booking in full from Stripe (**Payments → the payment → Refund**). The booking should turn `cancelled` and its nights free up. A partial refund leaves the booking as it is.

## Host dashboard

`/host` shows bookings, how many sites (and which rental gear) are taken each night, and page views. It isn't linked anywhere on the site, search engines are told not to list it, and it needs `HOST_PASSWORD`. Five wrong tries locks a visitor out for 15 minutes. Signing in lasts 14 days on that device.

Page views are counted by the site itself (api/view.ts) into the `page_views` and `visit_sources` tables: a count per page per day, with no cookies and nothing about the visitor stored. Only the live site counts, and not while you're signed in to the dashboard.

## Going live

Finish Stripe's account activation form, swap `STRIPE_SECRET_KEY` and the webhook (create it again in live mode) for the live versions, then make one real $28 booking and refund it from Stripe.

## How it works

- `api/availability.ts`: free sites and hookups per night.
- `api/checkout.ts`: checks the stay, holds the sites for 10 minutes and opens Stripe Checkout (open 31 minutes, Stripe's minimum is 30). When a hold has run out, the next checkout on those nights closes its Stripe page before taking the sites, so a late payer can't double-book.
- `api/stripe-webhook.ts`: confirms paid bookings and sends the emails; frees expired ones; cancels fully refunded ones.
- `api/cancel-hold.ts`: frees the sites when a guest backs out of the Stripe page.
- `api/booking-status.ts`: what the confirmation page shows.
- `api/_lib/rate-limit.ts`: limits how often one visitor can call each function (checkout: 6 per 10 minutes). Over the limit, the guest sees "Too many tries".
- Stays are capped at `maxNights` (14) in `src/content/site.ts`, checked by the calendar and the server. Stripe offers cards (with Apple Pay and Google Pay) and Link only.
- `db/schema.sql`: tables plus the `hold_booking` function, which checks and holds in one locked step so two guests can't both take the last site. `npm run test:db` checks it.
