import { fileURLToPath } from 'node:url'
import { Buffer } from 'node:buffer'
import { defineNuxtConfig } from 'nuxt/config'
import { auditNativeBundle } from './audit-bundle.mjs'

const entry = fileURLToPath(new URL('./entry.mjs', import.meta.url))
const i18nPlugin = fileURLToPath(new URL('./runtime/plugins/i18n.js', import.meta.resolve('@nuxtjs/i18n')))
const devicePlugin = fileURLToPath(new URL('./runtime/plugin.js', import.meta.resolve('@nuxtjs/device')))
const routerPlugin = fileURLToPath(new URL('../pages/runtime/plugins/router.js', import.meta.resolve('nuxt/app')))
const compiledUI = new Map()

export default defineNuxtConfig({
  extends: ['../..'],
  ssr: false,
  pages: true,
  devtools: { enabled: false },
  dir: { pages: fileURLToPath(new URL('./pages', import.meta.url)) },
  buildDir: './.nuxt',
  alias: { '#native-i18n': i18nPlugin, '#native-device': devicePlugin, '#native-router': routerPlugin },
  experimental: { hints: false },
  vite: {
    build: { minify: false },
    plugins: [{
      name: 'native-consumer-bundle-audit',
      enforce: 'post',
      applyToEnvironment: environment => environment.name === 'client',
      transform(code, id) {
        if (id.includes('/packages/UI/app/components/') && id.includes('.vue')
          && (code.includes('defineVaporComponent') || /__vapor:\s*true/.test(code))) {
          const file = id.split('/packages/UI/')[1].split('?')[0]
          const vdomImports = ['createVNode', 'createElementVNode', 'createElementBlock', 'openBlock']
            .filter(symbol => new RegExp(`\\b${symbol}\\b`).test(code))
          compiledUI.set(file, { file, vdomImports })
        }
      },
      generateBundle(_, bundle) {
        const chunks = Object.values(bundle).filter(item => item.type === 'chunk')
        const code = chunks.map(chunk => chunk.code).join('\n')
        const symbols = ['baseCreateRenderer', 'createVNode', 'ensureRenderer', 'vaporInteropImpl', 'vaporInteropPlugin']
        const retainedVDOM = symbols.filter(symbol => new RegExp(`(?:function|const|let|var) ${symbol}\\b`).test(code))
        const frameworkModules = [...new Set(chunks.flatMap(chunk => Object.keys(chunk.modules)))]
          .filter(id => /@vue\/runtime-|nuxt\/dist\/app\/(?:components\/nuxt-link|plugins\/router)/.test(id))
        const iconRendererModules = [...new Set(chunks.flatMap(chunk => Object.keys(chunk.modules)))]
          .filter(id => /@iconify\/vue|@nuxt\/icon\/dist\/runtime\/components/.test(id))
        this.emitFile({
          type: 'asset',
          fileName: '_nuxt/native-bundle.json',
          source: JSON.stringify({
            bootstrap: 'createVaporApp',
            interopInstalled: false,
            retainedVDOM,
            frameworkModules,
            iconRendererModules,
            compiledUI: [...compiledUI.values()].toSorted((left, right) => left.file.localeCompare(right.file)),
            chunks: chunks.map(chunk => ({ file: chunk.fileName, bytes: Buffer.byteLength(chunk.code) })),
          }, null, 2),
        })
      },
    }],
  },
  hooks: {
    'nitro:build:public-assets': nitro => {
      auditNativeBundle(nitro.options.output.publicDir)
    },
    'prepare:types': ({ tsConfig }) => {
      // A consumer checks library source, not the layers' unit-test harnesses.
      // Those fixtures run through the root Vitest configuration.
      tsConfig.exclude ??= []
      tsConfig.exclude.push(
        '../../../packages/UI/app/**/*.spec.ts',
        '../../../packages/Utilities/app/**/*.spec.ts',
      )
    },
    'vite:extendConfig': (config, { isClient }) => {
      if (isClient) {
        const clientBuild = config.environments?.client?.build ?? config.build
        clientBuild.rolldownOptions.input = { entry }
      }
    },
  },
  i18n: { bundle: { fullInstall: false } },
})
