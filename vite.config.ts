import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { rename, rm } from 'node:fs/promises'
import { join } from 'node:path'
import type {} from 'vite-react-ssg'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
    },
  },
})
