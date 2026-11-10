import { addOns, site } from '../content/site'

// Until a direct-booking widget is chosen, bookings go through Hipcamp.
// Swap the button below for the widget's embed code when it's ready.
const Book = () => {
  return (
    <section id="book" className="section dark book-page">
      <div className="container">
        <h1>Book your stay</h1>
        <div className="book-grid">
          <div className="book-summary">
            <p className="price">
              ${site.pricePerSiteNight}<span> / site / night</span>
            </p>
            <ul className="plain-list">
              <li>Open {site.season}</li>
              <li>Check in {site.checkIn}, check out {site.checkOut}</li>
              <li>Minimum stay {site.minNights} night; book {site.bookingWindow.toLowerCase()}</li>
              <li>{site.cancellation} cancellation policy</li>
            </ul>
            <a href={site.hipcampUrl} className="hero-btn primary" target="_blank" rel="noopener">
              Check dates and book
            </a>
            <p className="small">Booking opens on Hipcamp. Exact directions are sent after you book.</p>
          </div>
          <div className="book-addons">
            <h3>Add to your stay</h3>
            <table>
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
          </div>
        </div>
      </div>
    </section>
  )
}

export default Book
