import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import ArrowIcon from '../components/ArrowIcon'
import tentImage from '../assets/images/tent.webp'
import { notFoundPage as copy, site } from '../content/site'

// Shown for any address that isn't a real page. The build saves it as 404.html,
// which Vercel serves with a 404 status for unknown URLs.
const NotFoundPage = () => (
  <>
    <PageMeta title="Page not found" path="/404" description={`This page doesn’t exist on the ${site.name} website.`} />
    <section className="not-found">
      <img className="not-found-bg" src={tentImage} alt="" />
      <div className="container">
        <div className="not-found-card">
          <svg className="not-found-icon" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M8 52 32 12l24 40" />
            <path d="M32 12v40M24 52l8-14 8 14" />
            <path d="M4 52h56" />
          </svg>
          <p className="not-found-eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="not-found-text">{copy.text}</p>
          <div className="not-found-buttons">
            <Link to="/" className="hero-btn primary">{copy.homeLabel}</Link>
            <Link to="/book" className="hero-btn not-found-btn-outline">{copy.bookLabel}</Link>
          </div>
          <div className="not-found-more">
            <span>{copy.moreTitle}</span>
            {copy.moreLinks.map((l) => (
              <Link key={l.to} className="arrow-link" to={l.to}>{l.label} <ArrowIcon /></Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
)

export default NotFoundPage
