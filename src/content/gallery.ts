// Every image file dropped into src/assets/gallery is picked up
// automatically, sorted by file name. Add a caption (used as alt text)
// in galleryCaptions in site.ts, keyed by the file name.
import { galleryCaptions } from './site'

const files = import.meta.glob<string>('../assets/gallery/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
})

export type Photo = { src: string; alt: string; name: string }

export const photos: Photo[] = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => {
    const name = path.split('/').pop() ?? path
    return { src, name, alt: galleryCaptions[name] ?? 'Northern Oasis Camping' }
  })
