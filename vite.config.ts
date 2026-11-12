import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { imagetools } from 'vite-imagetools'
import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
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
      await addContentSecurityPolicy(dir)
    },
  },
})

// vite-react-ssg adds a preload tag to every page for every image the app
// imports (over 30 photos, about 15 MB on a phone), and with a crossorigin
// setting that makes browsers download many of them twice. Each page's
// <img> tags already load what that page needs, so the image preloads go.
async function stripImagePreloads(dir: string) {
  for (const file of await htmlFiles(dir)) {
    const html = await readFile(file, 'utf8')
    const cleaned = html.replace(/<link rel="preload" as="image"[^>]*>\s*/g, '')
    if (cleaned !== html) await writeFile(file, cleaned)
  }
}

const htmlFiles = async (dir: string) =>
  (await readdir(dir, { recursive: true })).filter((f) => f.endsWith('.html')).map((f) => join(dir, f))

// A Content-Security-Policy for each page: the browser only runs scripts,
// styles, fonts and connections from the places listed. The small inline
// scripts the pre-render step writes differ per page, so each page lists
// the hashes of its own. Framing and the other page-wide rules are set as
// headers in vercel.json. vercel.live is Vercel's preview toolbar.
async function addContentSecurityPolicy(dir: string) {
  for (const file of await htmlFiles(dir)) {
    const html = await readFile(file, 'utf8')
    const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
      (m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`,
    )
    const policy = [
      "default-src 'self'",
      `script-src 'self' ${hashes.join(' ')} https://vercel.live`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
      "font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com",
      "img-src 'self' data: blob: https://vercel.live https://vercel.com",
      "connect-src 'self' https://formspree.io https://vercel.live wss://ws-us3.pusher.com",
      'frame-src https://vercel.live',
    ].join('; ')
    const tag = `<meta http-equiv="Content-Security-Policy" content="${policy}">`
    await writeFile(file, html.replace(/<meta charset="UTF-8"\s*\/?>/i, (m) => `${m}\n    ${tag}`))
  }
}
