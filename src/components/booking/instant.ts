// With VITE_INSTANT_BOOKING=on (a Vercel environment variable), guests see
// live availability and pay on Stripe. Off, the form sends a booking request.
// See BOOKING_SETUP.md.
export const instantBooking = import.meta.env.VITE_INSTANT_BOOKING === 'on'
