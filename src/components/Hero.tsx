import { Link } from 'react-router-dom'
import lakeImage from '../assets/images/lake.webp'
import { site, quickFacts, quickDistances } from '../content/site'
import Icon from './Icon'

const Hero = () => {
  return (
    <>
      <section id="home" className="hero">
        <div className="hero-background">
          <img src={lakeImage} alt="Lake near Northern Oasis Camping" fetchPriority="high" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-eyebrow">Michigan's Upper Peninsula</p>
            <h1>{site.tagline}</h1>
            <p>RV and tent sites on 10 acres of maple forest, hosted by {site.hosts}</p>
            <div className="hero-buttons">
              <Link to="/book" className="hero-btn primary">Check availability</Link>
              <a href="#sites" className="hero-btn secondary">See the sites</a>
            </div>
            <p className="hero-rating">
              <span className="hero-rating-star" aria-hidden="true">★</span>{' '}
              <strong>{site.rating.recommendPercent}% recommend</strong> · {site.rating.ratings} Hipcamp ratings
            </p>
          </div>
        </div>
      </section>
      <section className="quick-facts" aria-label="Quick facts">
        <div className="qf-card">
          <ul className="qf-facts">
            {quickFacts.map((f) => (
              <li key={f.label}>
                <span className="qf-icon"><Icon name={f.icon} size={22} /></span>
                <span>
                  <span className="qf-value">{f.value}</span>
                  <span className="qf-label">{f.label}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="qf-dist">
            <Icon name="pin" size={16} />
            {quickDistances.map((d, i) => (
              <span key={d.place}>
                {i > 0 && <span className="qf-dot" aria-hidden="true">·</span>}
                <b>{d.miles} mi</b> {d.place}
              </span>
            ))}
          </p>
        </div>
      </section>
    </>
  )
}

export default Hero
