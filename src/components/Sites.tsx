import { amenities, siteDetails, site } from '../content/site'

const Sites = () => {
  return (
    <section id="sites" className="section light">
      <div className="container">
        <h2>The sites</h2>
        <p className="lead">
          {site.siteCount} dispersed RV and tent sites, ${site.pricePerSiteNight} per site per night.
        </p>
        <ul className="check-list">
          {siteDetails.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>

        <h3 id="amenities">Amenities</h3>
        <ul className="amenity-grid">
          {amenities.map((a) => (
            <li key={a.name} className={a.available ? 'yes' : 'no'}>
              <span className="amenity-name">
                <span aria-hidden="true">{a.available ? '✓' : '✕'}</span> {a.name}
              </span>
              <span className="amenity-detail">{a.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Sites
