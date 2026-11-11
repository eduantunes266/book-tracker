/// <reference types="vite/client" />

// Environment variables used by the app (defined in frontend/.env)
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
