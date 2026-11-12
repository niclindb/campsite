import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { imagetools } from 'vite-imagetools'
import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type {} from 'vite-react-ssg'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), imagetools()],
  // Pre-render every page to its own folder (/book/index.html, ...)
  // so each page loads fast and search engines can read it.
  ssgOptions: {
    dirStyle: 'nested',
    // Also render the "page not found" page (the '*' route) at /404, then move
    // it to dist/404.html. Vercel serves that file, with a 404 status, for any
    // address that isn't a real page.
    includedRoutes: (paths) => [...paths, '/404'],
    onFinished: async (dir) => {
      await rename(join(dir, '404', 'index.html'), join(dir, '404.html'))
      await rm(join(dir, '404'), { recursive: true })
      await stripImagePreloads(dir)
    },
  },
})

// vite-react-ssg adds a preload tag to every page for every image the app
// imports (over 30 photos, about 15 MB on a phone), and with a crossorigin
// setting that makes browsers download many of them twice. Each page's
// <img> tags already load what that page needs, so the image preloads go.
async function stripImagePreloads(dir: string) {
  const pages = (await readdir(dir, { recursive: true })).filter((f) => f.endsWith('.html'))
  for (const page of pages) {
    const file = join(dir, page)
    const html = await readFile(file, 'utf8')
    const cleaned = html.replace(/<link rel="preload" as="image"[^>]*>\s*/g, '')
    if (cleaned !== html) await writeFile(file, cleaned)
  }
}
