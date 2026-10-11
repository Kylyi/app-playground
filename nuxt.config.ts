import { existsSync } from 'node:fs'
import { env as processEnv } from 'node:process'
import { connectLibs } from './connect-libs.ts'
import { createResolver } from 'nuxt/kit'

const isMonorepo = processEnv.VITE_MONOREPO === 'true'
const connectedLibs = connectLibs()

const { resolve } = createResolver(import.meta.url)
const hasUtilitiesLib = isMonorepo || existsSync(resolve('./packages/Utilities'))

export default defineNuxtConfig({
  extends: [
    // Gentl
    ...hasUtilitiesLib
      ? ['./packages/UI', './packages/Utilities']
      : ['github:gentlsro/UI#2.3'],
  ],

  modules: [
    '@nuxt/image',
  ],

  ssr: true,

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

  vue: {
    vapor: true,
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

  vite: {
    resolve: {
      // Both renderers compare shared sentinels by identity (e.g. template refs).
      dedupe: ['vue', '@vue/shared', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom', '@vue/runtime-vapor'],
    },
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

  // UI icons are published by UnoCSS; avoid bundling every installed Iconify collection.
  icon: {
    serverBundle: { collections: [] },
  },

  unocss: {
    nuxtLayers: true,
  },
})
