import { useState } from 'react'
import lake from '../assets/images/lake.webp'
import tent from '../assets/images/tent.webp'
import { site } from '../content/site'

// Add photos here as they are exported to src/assets/images.
const photos = [
  { src: tent, alt: 'Orange tent among tall maples on a misty morning' },
  { src: lake, alt: 'Lake near the campground' },
]

const Gallery = () => {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="gallery" className="section">
      <div className="container">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {photos.map((p, i) => (
            <button key={p.alt} className="gallery-item" onClick={() => setOpen(i)} aria-label={`Enlarge: ${p.alt}`}>
              <img src={p.src} alt={p.alt} loading="lazy" />
            </button>
          ))}
        </div>
        <p className="more-link">
          <a href={site.hipcampUrl} target="_blank" rel="noopener">See 100 more photos on Hipcamp</a>
        </p>
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={photos[open].alt} onClick={() => setOpen(null)}>
          <img src={photos[open].src} alt={photos[open].alt} />
          <button className="lightbox-close" onClick={() => setOpen(null)} aria-label="Close">×</button>
        </div>
      )}
    </section>
  )
}

export default Gallery
