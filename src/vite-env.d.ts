/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORMSPREE_ID?: string
  readonly VITE_BOOKING_FORMSPREE_ID?: string
  readonly VITE_INSTANT_BOOKING?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
