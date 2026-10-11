import { defineVitestConfig } from '@nuxt/test-utils/config'
import { configDefaults } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineVitestConfig({
  // happy-dom uses Nuxt's client environment, which otherwise selects production branches.
  environments: {
    client: { define: { 'process.env.NODE_ENV': JSON.stringify('test') } },
  },
  resolve: {
    // Vue 3.6 RC's Node/CJS entry omits Vapor. Keep one ESM runtime graph,
    // including test-utils and SSR, so both renderers share refs and sentinels.
    alias: {
      ...Object.fromEntries([
        ['vue/server-renderer', '@vue/server-renderer/dist/server-renderer.esm-bundler.js'],
        ['vue', 'vue/dist/vue.esm-bundler.js'],
        ...['shared', 'reactivity', 'runtime-core', 'runtime-dom', 'runtime-vapor', 'server-renderer']
          .map(name => [`@vue/${name}`, `@vue/${name}/dist/${name}.esm-bundler.js`]),
        ['@vue/test-utils', '@vue/test-utils/dist/vue-test-utils.esm-bundler.mjs'],
      ].map(([name, path]) => {
        const packageName = path.startsWith('@') ? path.split('/').slice(0, 2).join('/') : path.split('/')[0]

        return [name, fileURLToPath(new URL(path.slice(packageName.length + 1), import.meta.resolve(`${packageName}/package.json`)))]
      })),
    },
  },
  test: {
    // Inline Vue consumers so Node/CJS cannot create a second reactivity graph.
    server: {
      deps: { inline: [/\/(?:vue|vue-demi|pinia|@vue|@vueuse)\//] },
    },
    exclude: [...configDefaults.exclude, 'tests/e2e/**', 'tooling/**'],
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        dotenv: {
          fileName: '.env',
        },
      },
    },
  },
})
