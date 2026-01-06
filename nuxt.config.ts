// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    // './libs/User',
    // './libs/Core',
    // './libs/Zenstack',
    // './libs/Utilities',
  ],

  modules: [
    '@unocss/nuxt',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/fonts',
  ],

  ssr: false,

  compatibilityDate: '2025-07-15',

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

  unocss: {
    nuxtLayers: true,
  },
})
