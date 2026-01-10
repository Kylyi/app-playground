import { join } from 'pathe'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/test-utils/module',
  ],

  $meta: {
    name: 'utilities',
  },

  imports: {
    imports: [
      { name: 'z', from: 'zod/v4' },
    ],
  },

  runtimeConfig: {
    public: {
      filesHost: '/api/files',
    },
  },

  alias: {
    $utilsConfig: join(process.cwd(), 'generated', 'utilsConfig.ts'),
    $comparatorEnum: join(process.cwd(), 'generated', 'comparator-enum.ts'),
    $dataType: join(process.cwd(), 'generated', 'data-type.type.ts'),
  },

  nitro: {
    imports: {
      imports: [
        { name: 'z', from: 'zod/v4' },

        // Lodash
        { name: 'get', from: 'lodash-es' },
        { name: 'set', from: 'lodash-es' },
        { name: 'isNil', from: 'lodash-es' },
        { name: 'pick', from: 'lodash-es' },
        { name: 'omit', from: 'lodash-es' },
        { name: 'isEmpty', from: 'lodash-es' },
        { name: 'isEqual', from: 'lodash-es' },

      ],
    },
  },

  typescript: {
    includeWorkspace: true,
  },

  i18n: {
    langDir: '../i18n',
    compilation: {
      strictMessage: false,
      escapeHtml: true,
    },
    locales: [
      {
        code: 'en-US',
        file: 'en-US_utilities.json',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        language: 'English',
        icon: 'i-emojione:flag-for-united-kingdom',
      },
      {
        code: 'cs-CZ',
        file: 'cs-CZ_utilities.json',
        dateFormat: 'DD.MM.YYYY',
        currency: 'CZK',
        language: 'Česky',
        icon: 'i-emojione:flag-for-czechia',
      },
    ],
  },
})
