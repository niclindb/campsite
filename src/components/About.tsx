import tentImage from '../assets/images/tent.webp'
import { about, site } from '../content/site'
import Icon from './Icon'

const About = () => {
  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="container">
        <div className="about-grid">
          <div className="about-photo">
            <img src={tentImage} alt="Orange tent in the misty maple forest at Northern Oasis" loading="lazy" />
          </div>
          <div className="about-text">
            <p className="about-eyebrow">About Northern Oasis</p>
            <h2 id="about-title">{about.heading}</h2>
            {about.paragraphs.map((p) => (
              <p key={p} className="about-copy">{p}</p>
            ))}
            <p className="about-signoff">
              <span className="about-signoff-name">{site.hosts}</span>
              <span className="about-signoff-role">Your hosts · {site.rating.badges[0]} on Hipcamp</span>
            </p>
          </div>
        </div>
        <ul className="about-highlights">
          {about.highlights.map((h) => (
            <li key={h.title}>
              <span className="about-highlight-icon"><Icon name={h.icon} /></span>
              <span>
                <span className="about-highlight-title">{h.title}</span>
                <span className="about-highlight-detail">{h.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default About
