interface ImportMetaEnv {
  readonly NUXT_PUBLIC_ENV: string
  readonly DB_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
