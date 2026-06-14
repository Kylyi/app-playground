import { join } from 'pathe'
import { cwd } from 'node:process'
import { readFileSync } from 'node:fs'

const isMonorepo = import.meta.env.VITE_MONOREPO === 'true'

export default defineNuxtConfig({
  extends: [
    // Gentl
    ...isMonorepo
      ? ['./libs/UI', './libs/Utilities']
      : ['github:gentlsro/UI#v2.1'],
  ],

  modules: [
    '@nuxt/image',
  ],

  ssr: false,

  components: {
    dirs: [{ path: './components', pathPrefix: false }],
  },

  future: {
    compatibilityVersion: 5,
  },

  compatibilityDate: '2026-04-17',

  typescript: {
    includeWorkspace: true,
  },

  eslint: {
    config: {
      standalone: false,
      stylistic: true,
    },
  },

  fonts: {
    defaults: {
      weights: [400, 600, 700],
      styles: ['normal', 'italic'],
    },
  },

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    },
  },

  icon: {
    size: '1em',
    mode: 'svg',
    serverBundle: {
      collections: (() => {
        try {
          const path = join(cwd(), 'generated', 'icon-collections.ts')
          const content = readFileSync(path, 'utf8')
          const m = content.match(/export const iconCollections = (\[[\s\S]*?\]) as const/)

          return m?.[1] ? JSON.parse(m[1]) : []
        } catch {
          return []
        }
      })(),
    },
  },

  unocss: {
    nuxtLayers: true,
  },
})
