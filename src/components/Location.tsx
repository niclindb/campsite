import { Link } from 'react-router-dom'
import { location } from '../content/site'
import AreaMap from './location/AreaMap'
import { Trail } from './ThingsToDo'

// "Where we are": the intro beside a drawn map of the area in the same
// layered frame as the About photo, then the things-to-do trail across the
// full width below a divider.
const Location = () => (
  <section id="location" className="location" aria-labelledby="location-title">
    <div className="container">
      <div className="location-grid">
        <div className="location-text">
          <p className="about-eyebrow">{location.eyebrow}</p>
          <h2 id="location-title">{location.heading}</h2>
          <p className="location-lead">{location.intro}</p>
          <Link to="/#contact" className="hero-btn primary">Ask us a question</Link>
        </div>
        <div className="location-map">
          <AreaMap />
        </div>
      </div>
      <h3 className="location-sub" id="things-to-do">{location.thingsToDoHeading}</h3>
      <Trail />
    </div>
  </section>
)

export default Location
