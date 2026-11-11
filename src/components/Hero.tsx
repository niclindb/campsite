import { Link } from 'react-router-dom'
import lakeImage from '../assets/images/lake.webp'
import { site } from '../content/site'

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
            <p>RV and tent sites on 10 acres of maple forest</p>
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
    </>
  )
}

export default Hero
