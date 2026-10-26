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
    optimizeDeps: {
      // Nuxt autoimports and lazy components expose these after the initial scan.
      // Pre-bundle the observed imports so cold navigation keeps one client graph.
      include: [
        '@comark/vue',
        '@floating-ui/dom',
        '@floating-ui/vue',
        '@iconify/utils/lib/css/icon',
        '@iconify/vue',
        '@tanstack/vue-virtual',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'arktype',
        'axios',
        'change-case',
        'dayjs/esm',
        'dayjs/esm/locale/cs',
        'dayjs/esm/locale/en-gb',
        'dayjs/esm/plugin/customParseFormat',
        'dayjs/esm/plugin/dayOfYear',
        'dayjs/esm/plugin/duration',
        'dayjs/esm/plugin/isBetween',
        'dayjs/esm/plugin/isSameOrAfter',
        'dayjs/esm/plugin/isSameOrBefore',
        'dayjs/esm/plugin/isoWeek',
        'dayjs/esm/plugin/quarterOfYear',
        'dayjs/esm/plugin/timezone',
        'dayjs/esm/plugin/utc',
        'dragdoll',
        'error-stack-parser-es',
        'errx',
        'fuse.js',
        'image-meta',
        'invert-color',
        'lodash-es',
        'mezr',
        'nostics',
        'nostics/formatters/ansi',
        'nostics/reporters/dev',
        'perfect-scrollbar',
        'sortablejs',
        'uuid',
        'valibot',
        'vite-plugin-vue-tracer/client/overlay',
        'xlsx',
        'zod',
      ],
    },
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

  // Build-time icons keep hashed assets; bundle only our runtime datasets.
  icon: {
    serverBundle: { collections: ['lucide', 'solar'] },
    customCollections: [{ prefix: 'playground', dir: resolve('./app/assets/testing-icons') }],
    aliases: { nativeAlias: 'playground:runtime-mark' },
    clientBundle: { scan: false, includeCustomCollections: false },
  },

  unocss: {
    nuxtLayers: true,
  },
})
