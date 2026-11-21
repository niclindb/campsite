import { bookPage, site } from '../content/site'
import BookingForm from './booking/BookingForm'
import { instantBooking } from './booking/instant'
import bannerImage from '../assets/images/lake.webp'

const facts: { label: string; value: string }[] = [
  { label: 'Season', value: site.season },
  { label: 'Check-in', value: site.checkIn },
  { label: 'Check-out', value: site.checkOut },
  { label: 'Guests per site', value: `Up to ${site.maxGuestsPerSite}` },
  { label: 'Book', value: `${site.bookingWindow}, stays up to ${site.maxNights} nights` },
  { label: 'Cancellation', value: site.cancellation },
]

// The booking page: photo banner, the booking form in a raised card, then
// how booking works (three step cards) and the house basics on a taped note.
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
        <div className="bk-how">
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
        <div className="bk-before">
          <h2>{bookPage.beforeTitle}</h2>
          <ul className="bk-facts">
            {facts.map((f) => (
              <li key={f.label}>
                <span className="glance-label">{f.label}</span>
                <span className="glance-value">{f.value}</span>
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
