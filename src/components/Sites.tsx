import { amenities, planFor, siteDetails, site } from '../content/site'
import Icon from './Icon'

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

        <div className="amenities" id="amenities">
          <div>
            <h3>On site</h3>
            <ul className="amenity-list">
              {amenities.map((a) => (
                <li key={a.name}>
                  <span className="amenity-icon"><Icon name={a.icon} /></span>
                  <span>
                    <span className="amenity-name">{a.name}</span>
                    <span className="amenity-detail">{a.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="plan-for" aria-labelledby="plan-for-title">
            <h3 id="plan-for-title">Plan ahead</h3>
            <p className="plan-for-intro">This is rustic camping. Here's what to know before you pack.</p>
            <ul className="amenity-list">
              {planFor.map((a) => (
                <li key={a.name}>
                  <span className="amenity-icon"><Icon name={a.icon} /></span>
                  <span>
                    <span className="amenity-name">{a.name}</span>
                    <span className="amenity-detail">{a.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Sites
