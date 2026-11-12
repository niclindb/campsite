import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { formatDay } from '../content/booking'
import { site } from '../content/site'

type Booking = {
  status: string
  arrive: string
  depart: string
  sites: number
  guests: number
  extras: string[]
  total: number
  tax: number
  firstName: string
}

// e.g. "$84" or "$89.04"
const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`

type State = { kind: 'loading' } | { kind: 'missing' } | { kind: 'found'; booking: Booking }

// Where Stripe sends guests after paying. The webhook usually confirms the
// booking within seconds, so a booking still marked "held" is checked again.
const BookConfirmedPage = () => {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (!sessionId) {
      setState({ kind: 'missing' })
      return
    }
    let tries = 0
    let timer: ReturnType<typeof setTimeout>
    const check = () =>
      fetch(`/api/booking-status?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((booking: Booking) => {
          setState({ kind: 'found', booking })
          if (booking.status === 'held' && ++tries < 10) timer = setTimeout(check, 2000)
        })
        .catch(() => setState({ kind: 'missing' }))
    check()
    return () => clearTimeout(timer)
  }, [])

  const b = state.kind === 'found' ? state.booking : null
  const confirmed = b?.status === 'confirmed'

  return (
    <>
      <PageMeta title="Booking confirmed" path="/book/confirmed" description={`Your booking at ${site.name}.`} />
      <section className="bk-page bk-confirm">
        <div className="container">
          <div className="bk-confirm-card" role="status">
            {state.kind === 'loading' && <h1>Checking your booking&hellip;</h1>}
            {state.kind === 'missing' && (
              <>
                <h1>Thanks for booking!</h1>
                <p>We couldn&rsquo;t load your booking details here, but if your payment went through, your confirmation email is on its way.</p>
              </>
            )}
            {b && (
              <>
                <h1>{confirmed ? `You’re booked, ${b.firstName}!` : 'Payment received'}</h1>
                <p>
                  {confirmed
                    ? 'Your confirmation email, with exact directions to camp, is on its way.'
                    : 'We’re just confirming your booking. This page updates in a moment.'}
                </p>
                <dl>
                  <div><dt>Dates</dt><dd>{formatDay(b.arrive)} to {formatDay(b.depart)}</dd></div>
                  <div><dt>Sites</dt><dd>{b.sites}</dd></div>
                  <div><dt>Guests</dt><dd>{b.guests}</dd></div>
                  {b.extras.length > 0 && <div><dt>Extras</dt><dd>{b.extras.join(', ')}</dd></div>}
                  {b.tax > 0 && <div><dt>Sales tax</dt><dd>{money(b.tax)}</dd></div>}
                  <div><dt>Paid</dt><dd>{money(b.total)}</dd></div>
                </dl>
                <p>Check-in is {site.checkIn.toLowerCase()}. See you in the maples!</p>
              </>
            )}
            <Link className="arrow-link" to="/info">Guest info &amp; FAQ</Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default BookConfirmedPage
