import { amenities, planFor } from '../../content/site'
import Icon from '../Icon'

// On-site amenities beside the "Plan ahead" card.
const Amenities = () => (
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
    <section className="plan-for" aria-labelledby="plan-for-title">
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
    </section>
  </div>
)

export default Amenities
