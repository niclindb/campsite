// Photos of the camping area live in src/assets/sites and are matched
// by the file names listed in campArea (site.ts). Thumbnails and an
// 800 px version are made at build time.
import { campArea } from './site'

const files = import.meta.glob<string>('../assets/sites/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
})
const thumbs = import.meta.glob<string>('../assets/sites/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
  query: { w: '400', format: 'webp', quality: '70' },
})
const srcsets = import.meta.glob<string>('../assets/sites/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
  query: { w: '800;1600', format: 'webp', quality: '72', as: 'srcset' },
})

const byName = (map: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(map).map(([path, src]) => [path.split('/').pop() ?? path, src]))
const full = byName(files)
const small = byName(thumbs)
const sets = byName(srcsets)

export type AreaPhoto = { src: string; thumb: string; srcSet: string }

export const area = {
  ...campArea,
  photos: campArea.photos
    .filter((p) => full[p])
    .map((p): AreaPhoto => ({ src: full[p], thumb: small[p] ?? full[p], srcSet: sets[p] ?? '' })),
}
