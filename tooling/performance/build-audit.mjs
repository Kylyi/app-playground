import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const workspace = resolve(import.meta.dirname, '../..')
const fixture = resolve(import.meta.dirname, 'app/Benchmark.vue')

export function benchmarkBuildAudit(options) {
  let parent
  const nativeUI = new Set()

  return [{
    name: 'benchmark-parent-compiler-selection',
    enforce: 'pre',
    transform(code, id) {
      if (id === fixture && options.parent === 'vdom') {
        // Compile one canonical fixture with either renderer, rather than
        // maintaining two templates whose workloads could silently diverge.
        assert.ok(code.startsWith('<script setup lang="ts" vapor>'))

        return code.replace('<script setup lang="ts" vapor>', '<script setup lang="ts">')
      }
    },
  }, {
    name: 'benchmark-compiled-parent-audit',
    enforce: 'post',
    applyToEnvironment: environment => environment.name === 'client',
    transform(code, id) {
      if (/\/UI\/app\/components\/.*\.vue(?:\?|$)/.test(id)
        && (code.includes('defineVaporComponent') || /__vapor:\s*true/.test(code))) {
        nativeUI.add(id.split('/UI/')[1].split('?')[0])
      }
      if (id.split('?')[0] === fixture
        && (id.includes('type=script') || (id === fixture && !code.startsWith('import _sfc_main')))) {
        parent = code.includes('defineVaporComponent') || /__vapor:\s*true/.test(code)
          ? 'vapor'
          : 'vdom'
        assert.equal(parent, options.parent, 'The measured parent must use the requested compiler')
      }
    },
    generateBundle(_, bundle) {
      assert.equal(parent, options.parent, 'The benchmark parent must be compiled and audited')
      if (!options.native) {
        assert.equal(nativeUI.size, 0, 'VDOM controls must not retain native UI components')
      } else {
        assert.equal(nativeUI.size, 242, 'Native controls must compile every UI SFC')
      }
      this.emitFile({
        type: 'asset',
        fileName: '_nuxt/benchmark-build.json',
        source: JSON.stringify({
          variant: options.renderer,
          parent,
          root: 'vdom',
          sourceSha256: options.sourceSha256,
          preparedSourceSha256: options.preparedSourceSha256,
          nativeUI: [...nativeUI].sort(),
          fixtureSha256: createHash('sha256').update(readFileSync(fixture)).digest('hex'),
          chunks: Object.values(bundle)
            .filter(item => item.type === 'chunk')
            .map(chunk => ({
              file: chunk.fileName,
              modules: Object.entries(chunk.modules).map(([id, module]) => ({
                id: id.replaceAll(workspace, '<workspace>'),
                renderedLength: module.renderedLength,
              })),
            })),
        }, null, 2),
      })
    },
  }]
}
