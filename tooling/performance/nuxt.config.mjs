import { resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import process from 'node:process'
import { defineNuxtConfig } from 'nuxt/config'
import { benchmarkBuildAudit } from './build-audit.mjs'
import { variants } from './variants.mjs'

const workspace = resolve(import.meta.dirname, '../..')
const renderer = process.env.VAPOR_PERFORMANCE_RENDERER ?? 'vapor-parent'
if (!Object.hasOwn(variants, renderer)) {
  throw new Error(`Unknown benchmark variant: ${renderer}`)
}
const variant = variants[renderer]
const native = variant.compiler ? variant.compiler === 'vapor' : renderer === 'vapor' || renderer === 'vapor-parent'
const layers = variant.layers ?? (renderer === 'vdom'
  ? resolve(workspace, '.cache/vapor-performance-baseline')
  : renderer === 'current-vdom'
    ? resolve(workspace, '.cache/vapor-performance-current-vdom')
    : resolve(workspace, 'packages'))
const controlFile = resolve(layers, 'source.json')
const control = !native && existsSync(controlFile) ? JSON.parse(readFileSync(controlFile, 'utf8')) : undefined
const preparedSourceSha256 = control?.preparedSources
  ? createHash('sha256').update(JSON.stringify(control.preparedSources)).digest('hex')
  : undefined

export default defineNuxtConfig({
  extends: [resolve(layers, 'UI'), resolve(layers, 'Utilities')],
  ssr: true,
  pages: false,
  devtools: { enabled: false },
  vue: { vapor: native },
  runtimeConfig: {
    public: { benchmarkRenderer: renderer, benchmarkParent: variant.parent },
  },
  srcDir: './app',
  buildDir: resolve(import.meta.dirname, '.nuxt', renderer),
  sourcemap: { client: 'hidden', server: false },
  experimental: { hints: false },
  compatibilityDate: '2026-07-06',
  nitro: { output: { dir: resolve(import.meta.dirname, '.output', renderer) } },
  vite: {
    // Hidden maps support CPU attribution without changing the JS payload or
    // enabling profiling overhead during the uninstrumented timing run.
    build: { sourcemap: 'hidden' },
    plugins: benchmarkBuildAudit({ renderer, parent: variant.parent, native, sourceSha256: variant.sourceSha256, preparedSourceSha256 }),
    resolve: { dedupe: ['vue', '@vue/shared', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-vapor'] },
  },
  hooks: {
    'prepare:types': ({ tsConfig }) => {
      tsConfig.exclude ??= []
      tsConfig.exclude.push(`${layers}/UI/app/**/*.spec.ts`, `${layers}/Utilities/app/**/*.spec.ts`)
    },
  },
  fonts: { defaults: { families: [] } },
  i18n: {
    defaultLocale: 'en-US',
    detectBrowserLanguage: false,
    bundle: { fullInstall: false },
  },
  icon: { serverBundle: { collections: ['lucide'] }, clientBundle: { scan: false, includeCustomCollections: false } },
})
