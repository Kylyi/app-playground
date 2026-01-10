type ImportMetaEnv = {
  readonly NUXT_PUBLIC_ENV: string
  readonly DB_URL: string
}

type ImportMeta = {
  readonly env: ImportMetaEnv
}
