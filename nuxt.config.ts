import { join } from 'pathe'

export default defineNuxtConfig({
  extends: [
    './libs/User',
    // './libs/Core',
    './libs/Zenstack',
    './libs/UI',
    './libs/Utilities',
  ],

  modules: [
    '@nuxt/image',
    '@pinia/colada-nuxt',
  ],

  ssr: false,

  compatibilityDate: '2025-07-15',

  nitro: {
    experimental: {
      openAPI: true,
    },

    openAPI: {
      route: join('/open-api.json'),
    },
  },

  typescript: {
    includeWorkspace: true,

    tsConfig: {
      compilerOptions: {
        types: ['nuxt'],
      },
    },
  },

  fonts: {
    defaults: {
      weights: [400, 600, 700],
      styles: ['normal', 'italic'],
    },
  },

  unocss: {
    nuxtLayers: true,
  },
})
