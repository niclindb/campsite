import { Link } from 'react-router-dom'
import { location } from '../content/site'
import Icon from './Icon'
import AreaMap from './location/AreaMap'

// "Where we are": the distances as a dotted route on a raised card, beside a
// drawn map of the area in the same layered frame as the About photo.
const Location = () => (
  <section id="location" className="location" aria-labelledby="location-title">
    <div className="container location-grid">
      <div className="location-text">
        <p className="about-eyebrow">Location</p>
        <h2 id="location-title">{location.heading}</h2>
        <p className="location-lead">{location.intro}</p>
        <ol className="location-route" aria-label="Distances from camp">
          <li className="location-route-start">
            <span className="location-route-dot"><Icon name="tent" size={16} /></span>
            <b>Northern Oasis</b>
          </li>
          {location.distances.map((d) => (
            <li key={d.place}>
              <span className="location-route-dot" />
              <span className="location-route-text"><b>{d.place}</b><span>{d.detail}</span></span>
              <strong>{d.miles} mi</strong>
            </li>
          ))}
        </ol>
        <p className="location-privacy"><Icon name="pin" size={20} /><span>{location.privacy}</span></p>
        <Link to="/#contact" className="hero-btn primary">Ask us a question</Link>
      </div>
      <div className="location-map">
        <AreaMap />
      </div>
    </div>
  </section>
)

export default Location
