import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import type {} from 'vite-react-ssg'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pre-render every page to its own folder (/book/index.html, ...)
  // so each page loads fast and search engines can read it.
  ssgOptions: {
    dirStyle: 'nested',
  },
})
