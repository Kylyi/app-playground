import { join } from 'pathe'
import { cwd } from 'node:process'
import { readFileSync } from 'node:fs'
import { connectLibs } from './connect-libs'

const isMonorepo = import.meta.env.VITE_MONOREPO === 'true'
const connectedLibs = connectLibs()

export default defineNuxtConfig({
  extends: [
    // Gentl
    ...isMonorepo
      ? ['./packages/UI', './packages/Utilities']
      : ['github:gentlsro/UI#2.3'],
  ],

  modules: [
    '@nuxt/image',
  ],

  ssr: false,

  components: {
    dirs: [
      { path: './components', pathPrefix: false },
      ...connectedLibs.componentDirs,
    ],
  },

  imports: {
    dirs: [
      ...connectedLibs.importDirs,
    ],
  },

  future: {
    compatibilityVersion: 5,
  },

  compatibilityDate: '2026-07-06',

  nitro: {
    imports: {
      dirsScanOptions: {
        fileFilter: file => {
          const allowed = ['UI', 'Utilities']

          return allowed.some(allowed => file.includes(allowed))
        },
      },
    },

    scanDirs: [
      ...connectedLibs.serverDirs,
    ],
  },

  hooks: {
    'prepare:types': ({ tsConfig, sharedTsConfig }) => {
      tsConfig.include ??= []
      tsConfig.include.push(...connectedLibs.appTypeIncludes)

      sharedTsConfig.include ??= []
      sharedTsConfig.include.push(...connectedLibs.sharedTypeIncludes)
    },

    'nitro:config': nitroConfig => {
      nitroConfig.typescript ??= {}
      nitroConfig.typescript.tsConfig ??= {}
      nitroConfig.typescript.tsConfig.include ??= []
      nitroConfig.typescript.tsConfig.include.push(...connectedLibs.serverTypeIncludes)
    },
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
