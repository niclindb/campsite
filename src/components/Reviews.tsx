import bgImage from '../assets/gallery/17-tall-maples.webp'
import bgSrcSet from '../assets/gallery/17-tall-maples.webp?w=800;1600&format=webp&quality=72&as=srcset&imagetools'
import { reviews, reviewsSection, site } from '../content/site'
import ArrowIcon from './ArrowIcon'

const AwardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="9" r="6" />
    <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
  </svg>
)

// Tall-maples photo behind a dark overlay; stats row, then glass quote cards.
const Reviews = () => {
  const { recommendPercent, awards } = site.rating
  return (
    <section id="reviews" className="reviews" aria-labelledby="reviews-title">
      <img className="reviews-bg" src={bgImage} srcSet={bgSrcSet} sizes="100vw" alt="" loading="lazy" />
      <div className="container reviews-inner">
        <p className="reviews-eyebrow">{reviewsSection.eyebrow}</p>
        <h2 id="reviews-title">{reviewsSection.heading}</h2>

        <ul className="reviews-stats">
          <li className="reviews-stat">
            <span className="reviews-stat-big">{recommendPercent}%</span>
            <span className="reviews-stat-sub">{reviewsSection.recommendLabel}</span>
          </li>
          {awards.map((a) => (
            <li key={a.title} className="reviews-stat">
              <span className="reviews-stat-icon"><AwardIcon /></span>
              <span className="reviews-stat-title">{a.title}</span>
              <span className="reviews-stat-sub">{a.detail}</span>
            </li>
          ))}
        </ul>

        <div className="reviews-cards">
          {reviews.map((r) => (
            <figure key={r.name} className="review-card">
              <blockquote>{r.quote}</blockquote>
              <figcaption>
                <span className="review-rule" aria-hidden="true" />
                <span className="review-name">{r.name}</span>
                <span className="review-source">via Hipcamp</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="reviews-more">
          <a className="arrow-link" href={site.hipcampUrl} target="_blank" rel="noopener">
            Read {site.rating.reviewsLabel} reviews on Hipcamp <ArrowIcon />
          </a>
        </p>
      </div>
    </section>
  )
}

export default Reviews
