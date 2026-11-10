import lakeImage from '../assets/images/lake.webp'
import { site, quickFacts } from '../content/site'

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
            <h1>{site.tagline}</h1>
            <p>
              Five RV and tent sites on 10 acres of maple forest in Michigan's Upper Peninsula,
              hosted by {site.hosts} Open {site.season}.
            </p>
            <div className="hero-buttons">
              <a href="#book" className="hero-btn primary">Book your stay</a>
              <a href="#sites" className="hero-btn secondary">See the sites</a>
            </div>
          </div>
        </div>
      </section>
      <section className="trust-strip" aria-label="Guest ratings">
        <p>
          <strong>{site.rating.recommendPercent}% recommend</strong> from {site.rating.ratings} ratings on Hipcamp
          {site.rating.badges.map((b) => (
            <span key={b} className="badge">{b}</span>
          ))}
        </p>
      </section>
      <section className="quick-facts" aria-label="Quick facts">
        <ul>
          {quickFacts.map((f) => (
            <li key={f.label}>
              <span className="qf-value">{f.value}</span>
              <span className="qf-label">{f.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Hero
