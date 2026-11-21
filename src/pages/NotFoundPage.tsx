import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import ArrowIcon from '../components/ArrowIcon'
import bgImage from '../assets/gallery/11-falls.webp'
import bgSrcSet from '../assets/gallery/11-falls.webp?w=800;1600&format=webp&quality=72&as=srcset&imagetools'
import { notFoundPage as copy, site } from '../content/site'

// Shown for any address that isn't a real page. The build saves it as 404.html,
// which Vercel serves with a 404 status for unknown URLs.
const NotFoundPage = () => (
  <>
    <PageMeta title="Page not found" path="/404" description={`This page doesn’t exist on the ${site.name} website.`} />
    <section className="not-found">
      <img className="not-found-bg" src={bgImage} srcSet={bgSrcSet} sizes="100vw" alt="" />
      <div className="container">
        <div className="not-found-content">
          <p className="not-found-code" aria-hidden="true">404</p>
          <h1>{copy.title}</h1>
          <p className="not-found-text">{copy.text}</p>
          <div className="not-found-buttons">
            <Link to="/" className="hero-btn primary">{copy.homeLabel}</Link>
            <Link to="/book" className="hero-btn secondary">{copy.bookLabel}</Link>
          </div>
          {/* The other links sit on a short dashed trail, like Things to do */}
          <nav className="not-found-trail" aria-label={copy.moreTitle}>
            <p className="not-found-here">{copy.hereLabel}</p>
            <ul>
              {copy.moreLinks.map((l) => (
                <li key={l.to}><Link className="arrow-link" to={l.to}>{l.label} <ArrowIcon /></Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  </>
)

export default NotFoundPage
