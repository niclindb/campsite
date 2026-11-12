/// <reference types="vite/client" />

// Resized images made at build time by vite-imagetools, e.g.
// import logo from './logo.webp?w=320&imagetools'
declare module '*&imagetools' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_FORMSPREE_ID?: string
  readonly VITE_BOOKING_FORMSPREE_ID?: string
  readonly VITE_INSTANT_BOOKING?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
