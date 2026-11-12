import { bookPage, site } from '../content/site'
import type { IconName } from './Icon'
import Icon from './Icon'
import BookingForm from './booking/BookingForm'
import { instantBooking } from './booking/instant'
import bannerImage from '../assets/images/lake.webp'

const facts: { icon: IconName; label: string; value: string }[] = [
  { icon: 'calendar', label: 'Season', value: site.season },
  { icon: 'clock', label: 'Check-in', value: site.checkIn },
  { icon: 'clock', label: 'Check-out', value: site.checkOut },
  { icon: 'users', label: 'Guests per site', value: `Up to ${site.maxGuestsPerSite}` },
  { icon: 'tag', label: 'Book', value: site.bookingWindow },
  { icon: 'shield', label: 'Cancellation', value: site.cancellation },
]

// The booking page: photo banner, the booking request form in a raised
// card, then how booking works and the house basics.
const Book = () => {
  const copy = instantBooking ? { ...bookPage, ...bookPage.instant } : bookPage
  return (
  <div className="bk-page">
    <section className="info-banner bk-banner">
      <img src={bannerImage} alt="" />
      <div className="container">
        <p className="contact-eyebrow">{bookPage.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </div>
    </section>

    <div className="container">
      <section id="book" className="bk-card" aria-label={bookPage.eyebrow}>
        <BookingForm />
      </section>
    </div>

    <section className="bk-below">
      <div className="container bk-below-grid">
        <div>
          <h2>{bookPage.stepsTitle}</h2>
          <ol className="bk-steps">
            {copy.steps.map((s) => (
              <li key={s.title}>
                <strong>{s.title}</strong>
                <span>{s.detail}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2>{bookPage.beforeTitle}</h2>
          <ul className="bk-facts">
            {facts.map((f) => (
              <li key={f.label}>
                <span className="about-highlight-icon"><Icon name={f.icon} size={18} /></span>
                <span>
                  <span className="glance-label">{f.label}</span>
                  <span className="glance-value">{f.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  </div>
  )
}

export default Book
