import { addOns, bookPage, site } from '../content/site'
import type { IconName } from './Icon'
import Icon from './Icon'
import BookingForm from './booking/BookingForm'
import bannerImage from '../assets/images/lake.webp'
import sideImage from '../assets/images/tent.webp'

const facts: { icon: IconName; label: string; value: string }[] = [
  { icon: 'calendar', label: 'Season', value: site.season },
  { icon: 'clock', label: 'Check-in', value: site.checkIn },
  { icon: 'clock', label: 'Check-out', value: site.checkOut },
  { icon: 'moon', label: 'Minimum stay', value: `${site.minNights} night` },
  { icon: 'tag', label: 'Book', value: site.bookingWindow },
  { icon: 'shield', label: 'Cancellation', value: site.cancellation },
]

const Facts = () => (
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
)

const AddOns = () => (
  <table className="bk-addons">
    <tbody>
      {addOns.map((a) => (
        <tr key={a.name}>
          <th scope="row">
            {a.name}
            <span>{a.note}</span>
          </th>
          <td>${a.price}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export type BookLayout = 'a' | 'b' | 'c'

// Bookings are finished on Hipcamp until a direct-booking system is set up.
// The form fills in the guest's dates and party size on the Hipcamp listing.
const Book = ({ layout = 'a' }: { layout?: BookLayout }) => {
  if (layout === 'b') {
    return (
      <section id="book" className="bk-page bk-layout-b">
        <div className="container bk-b-grid">
          <div>
            <p className="contact-eyebrow">{bookPage.eyebrow}</p>
            <h1>{bookPage.title}</h1>
            <p className="bk-intro">{bookPage.intro}</p>
            <img className="bk-b-photo" src={sideImage} alt="A tent among the maples at Northern Oasis" />
            <h2>{bookPage.beforeTitle}</h2>
            <Facts />
            <h2>{bookPage.addOnsTitle}</h2>
            <p className="bk-note">{bookPage.addOnsNote}</p>
            <AddOns />
          </div>
          <aside className="bk-b-card">
            <h2>{bookPage.formTitle}</h2>
            <BookingForm layout="stack" />
          </aside>
        </div>
      </section>
    )
  }

  if (layout === 'c') {
    return (
      <section id="book" className="bk-page bk-layout-c">
        <div className="container">
          <div className="bk-c-head">
            <p className="contact-eyebrow">{bookPage.eyebrow}</p>
            <h1>{bookPage.title}</h1>
            <p className="bk-intro">{bookPage.intro}</p>
          </div>
          <div className="bk-c-card">
            <BookingForm layout="split" />
          </div>
          <div className="bk-c-below">
            <div>
              <h2>{bookPage.beforeTitle}</h2>
              <Facts />
            </div>
            <div>
              <h2>{bookPage.addOnsTitle}</h2>
              <p className="bk-note">{bookPage.addOnsNote}</p>
              <ul className="bk-chips">
                {addOns.map((a) => (
                  <li key={a.name}>
                    <strong>{a.name}</strong> ${a.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="bk-page bk-layout-a">
      <section className="info-banner bk-banner">
        <img src={bannerImage} alt="" />
        <div className="container">
          <p className="contact-eyebrow">{bookPage.eyebrow}</p>
          <h1>{bookPage.title}</h1>
          <p>{bookPage.intro}</p>
        </div>
      </section>
      <div className="container">
        <section id="book" className="bk-a-card" aria-label={bookPage.formTitle}>
          <BookingForm layout="row" />
        </section>
      </div>
      <section className="bk-a-below">
        <div className="container bk-a-grid">
          <div>
            <h2>{bookPage.beforeTitle}</h2>
            <Facts />
          </div>
          <div className="bk-a-addons">
            <h2>{bookPage.addOnsTitle}</h2>
            <p className="bk-note">{bookPage.addOnsNote}</p>
            <AddOns />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Book
