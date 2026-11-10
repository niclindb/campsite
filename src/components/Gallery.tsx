import { useEffect, useRef, useState } from 'react'
import { photos } from '../content/gallery'
import { site } from '../content/site'
import Lightbox from './gallery/Lightbox'

// A slight, fixed tilt per photo so the snapshots look hand-placed.
const tilts = [-3, 2, -1.5, 3, -2.5, 1.5]
const tilt = (i: number) => tilts[i % tilts.length]

const Gallery = () => {
  const [cur, setCur] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  const strip = useRef<HTMLDivElement>(null)
  const touchX = useRef<number | null>(null)
  const n = photos.length

  // Keep the selected snapshot in view as the strip scrolls.
  useEffect(() => {
    const el = strip.current?.children[cur] as HTMLElement | undefined
    const s = strip.current
    if (!el || !s) return
    s.scrollTo({ left: el.offsetLeft - (s.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' })
  }, [cur])

  if (n === 0) return null
  const go = (d: number) => setCur((cur + d + n) % n)
  const p = photos[cur]

  return (
    <section id="gallery" className="section gallery">
      <div className="container">
        <h2>Gallery</h2>

        <div className="pola-main">
          {n > 1 && <button className="pola-arrow" onClick={() => go(-1)} aria-label="Previous photo">←</button>}
          <figure
            className="pola-card big"
            style={{ transform: `rotate(${tilt(cur) / 2}deg)` }}
            key={cur}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return
              const dx = e.changedTouches[0].clientX - touchX.current
              if (Math.abs(dx) > 40 && n > 1) go(dx < 0 ? 1 : -1)
              touchX.current = null
            }}
          >
            <button onClick={() => setOpen(cur)} aria-label={`Enlarge: ${p.alt}`}>
              <img src={p.src} alt={p.alt} />
            </button>
            <figcaption>{p.alt}</figcaption>
          </figure>
          {n > 1 && <button className="pola-arrow" onClick={() => go(1)} aria-label="Next photo">→</button>}
        </div>

        {n > 1 && (
          <div className="pola-strip" ref={strip}>
            {photos.map((ph, i) => (
              <button
                key={ph.name}
                className={`pola-card mini ${i === cur ? 'on' : ''}`}
                style={{ transform: `rotate(${tilt(i)}deg)` }}
                onClick={() => setCur(i)}
                aria-label={`Show: ${ph.alt}`}
                aria-current={i === cur}
              >
                <img src={ph.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <p className="more-link">
          <a href={site.hipcampUrl} target="_blank" rel="noopener">See more guest photos on Hipcamp</a>
        </p>
      </div>
      {open !== null && <Lightbox photos={photos} index={open} onChange={setOpen} />}
    </section>
  )
}

export default Gallery
