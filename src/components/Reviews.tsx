import { reviews, site } from '../content/site'

const Reviews = () => {
  return (
    <section id="reviews" className="section dark">
      <div className="container">
        <h2>What campers say</h2>
        <div className="review-grid">
          {reviews.map((r) => (
            <figure key={r.name} className="review">
              <blockquote>“{r.quote}”</blockquote>
              <figcaption>{r.name}, Hipcamp</figcaption>
            </figure>
          ))}
        </div>
        <p className="more-link">
          <a href={site.hipcampUrl} target="_blank" rel="noopener">Read all {site.rating.reviews} reviews</a>
        </p>
      </div>
    </section>
  )
}

export default Reviews
