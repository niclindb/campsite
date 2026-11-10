import { useEffect, useRef } from 'react'
import type { Photo } from '../../content/gallery'

type Props = { photos: Photo[]; index: number; onChange: (i: number | null) => void }

// Full-size viewer with arrows, keyboard and swipe.
const Lightbox = ({ photos, index, onChange }: Props) => {
  const touchX = useRef<number | null>(null)
  const n = photos.length
  const go = (d: number) => onChange((index + d + n) % n)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      if (e.key === 'ArrowRight') onChange((index + 1) % n)
      if (e.key === 'ArrowLeft') onChange((index - 1 + n) % n)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, n, onChange])

  const p = photos[index]
  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={p.alt}
      onClick={() => onChange(null)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
    >
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={p.src} alt={p.alt} />
        <figcaption>
          <span>{p.alt}</span>
          <span className="lightbox-count">{index + 1} / {n}</span>
        </figcaption>
      </figure>
      <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Previous photo">‹</button>
      <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Next photo">›</button>
      <button className="lightbox-close" onClick={() => onChange(null)} aria-label="Close">×</button>
    </div>
  )
}

export default Lightbox
