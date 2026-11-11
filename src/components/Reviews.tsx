import { reviews, site } from '../content/site'
import ArrowIcon from './ArrowIcon'

const { recommendPercent, badges } = site.rating

const AwardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="9" r="6" />
    <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
  </svg>
)

const Reviews = () => {
  return (
    <section id="reviews" className="section dark">
      <div className="container reviews-layout">
        <div className="reviews-quotes">
          <h2>What campers say</h2>
          {reviews.map((r) => (
            <figure key={r.name} className="review">
              <blockquote>“{r.quote}”</blockquote>
              <figcaption>{r.name} · Hipcamp</figcaption>
            </figure>
          ))}
        </div>
        <aside className="reviews-summary">
          <p className="reviews-percent">{recommendPercent}%</p>
          <p className="reviews-percent-label">of campers recommend us on Hipcamp</p>
          <ul className="reviews-badges">
            {badges.map((b) => (
              <li key={b}><AwardIcon />{b}</li>
            ))}
          </ul>
          <a className="arrow-link reviews-link" href={site.hipcampUrl} target="_blank" rel="noopener">
            Read {site.rating.reviewsLabel} reviews on Hipcamp <ArrowIcon />
          </a>
        </aside>
      </div>
    </section>
  )
}

export default Reviews
