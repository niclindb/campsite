// Photos of the camping area live in src/assets/sites and are matched
// by the file names listed in campArea (site.ts).
import { campArea } from './site'

const files = import.meta.glob<string>('../assets/sites/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
})

const byName: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, src]) => [path.split('/').pop() ?? path, src]),
)

export const area = {
  ...campArea,
  srcs: campArea.photos.map((p) => byName[p]).filter(Boolean),
}
