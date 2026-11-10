import { useState } from 'react'
import { Link } from 'react-router-dom'
import { siteDetails, site } from '../content/site'
import { area } from '../content/sites'
import Amenities from './sites/Amenities'
import SitePhoto from './sites/SitePhoto'

// "Where you'll camp": one wide photo of the camping area with a card over
// its corner, and a strip of smaller photos overlapping its bottom edge.
// Tapping a small photo shows it in the big frame.
const Sites = () => {
  const [cur, setCur] = useState(0)
  return (
    <section id="sites" className="section light sites-a3">
      <div className="container">
        <p className="about-eyebrow">The sites</p>
        <h2>Where you'll camp</h2>
        <p className="lead">One open, wooded camping area with room for {site.siteCount} sites.</p>

        <div className="a3-stage">
          <div className="a3-hero">
            <SitePhoto key={cur} src={area.srcs[cur]} alt={`The camping area, photo ${cur + 1}`} temporary={area.temporaryPhotos} />
          </div>
          <div className="a3-card">
            <h3>{area.name}</h3>
            <ul className="site-tags">
              {area.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className="site-details">{area.summary}</p>
            <Link to="/book" className="hero-btn primary">Book a spot</Link>
          </div>
        </div>
        <div className="a3-strip">
          {area.srcs.map((src, i) => (
            <button
              key={src}
              className={i === cur ? 'active' : ''}
              onClick={() => setCur(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === cur}
            >
              <SitePhoto src={src} alt="" temporary={area.temporaryPhotos} />
            </button>
          ))}
        </div>

        <div className="sites-good-to-know">
          <h3>Good to know</h3>
          <ul className="check-list two-col">
            {siteDetails.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>

        <Amenities />
      </div>
    </section>
  )
}

export default Sites
