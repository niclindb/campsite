// Every image file dropped into src/assets/gallery is picked up
// automatically, sorted by file name. Add a caption (used as alt text)
// in galleryCaptions in site.ts, keyed by the file name.
// Smaller copies (thumbnails and an 800 px version) are made at build time,
// so phones never download the full-size photo just to show it small.
import { galleryCaptions } from './site'

const files = import.meta.glob<string>('../assets/gallery/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
})
const thumbs = import.meta.glob<string>('../assets/gallery/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
  query: { w: '240', format: 'webp', quality: '70' },
})
const srcsets = import.meta.glob<string>('../assets/gallery/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
  query: { w: '800;1600', format: 'webp', quality: '72', as: 'srcset' },
})

export type Photo = { src: string; thumb: string; srcSet: string; alt: string; name: string }

export const photos: Photo[] = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => {
    const name = path.split('/').pop() ?? path
    return { src, thumb: thumbs[path] ?? src, srcSet: srcsets[path] ?? '', name, alt: galleryCaptions[name] ?? 'Northern Oasis Camping' }
  })
