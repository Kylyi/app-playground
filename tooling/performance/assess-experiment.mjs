import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'

const file = process.argv[2]
const report = JSON.parse(readFileSync(file, 'utf8'))
function median(values) {
  const sorted = values.toSorted((left, right) => left - right)

  return (sorted[(sorted.length - 1) >> 1] + sorted[sorted.length >> 1]) / 2
}
const quantile = (values, fraction) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * fraction) - 1]
let seed = 0x12345678
function random() {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5

  return (seed >>> 0) / 4294967296
}
assert.equal(report.failure, undefined)
assert.deepEqual(report.retentionFailures, [])
const assessments = report.families.map(family => {
  const samples = report.samples.filter(sample => sample.family === family)
  const pairs = Object.fromEntries(['vdom', 'vapor'].map(compiler => {
    const before = samples.filter(sample => sample.renderer === `before-${compiler}`).toSorted((a, b) => a.trial - b.trial)
    const after = samples.filter(sample => sample.renderer === `after-${compiler}`).toSorted((a, b) => a.trial - b.trial)
    assert.equal(before.length, 64)
    assert.equal(after.length, 64)
    const differences = before.map((sample, index) => {
      assert.equal(sample.trial, after[index].trial)
      assert.equal(sample.rows, after[index].rows)

      return after[index].mount.contentReady - sample.mount.contentReady
    })
    const bootstrap = Array.from({ length: 10000 }, () => median(Array.from({ length: 64 }, () => differences[Math.floor(random() * 64)])))

    return [compiler, {
      beforeMedian: median(before.map(sample => sample.mount.contentReady)),
      afterMedian: median(after.map(sample => sample.mount.contentReady)),
      beforeP95: quantile(before.map(sample => sample.mount.contentReady), 0.95),
      afterP95: quantile(after.map(sample => sample.mount.contentReady), 0.95),
      pairedMedianDelta: median(differences),
      pairedMedianDelta95CI: [quantile(bootstrap, 0.025), quantile(bootstrap, 0.975)],
      blocks: [0, 32].map(start => ({
        before: median(before.slice(start, start + 32).map(sample => sample.mount.contentReady)),
        after: median(after.slice(start, start + 32).map(sample => sample.mount.contentReady)),
      })),
    }]
  }))
  const native = pairs.vapor
  // Clock doubles can represent a 0.20ms saving as 0.199999988ms. Normalize
  // below timer resolution before applying the unchanged 0.20ms budget.
  const nativeMedianSaving = Math.round((native.beforeMedian - native.afterMedian) * 1e6) / 1e6

  return { family, ...pairs, measuredNativeImprovement: nativeMedianSaving >= 0.2
    && native.pairedMedianDelta95CI[1] < 0
    && native.blocks.every(block => block.after < block.before) }
})
const result = { method: '64 paired trials; deterministic 10,000-resample percentile bootstrap of median paired differences; two 32-trial blocks. Diagnostic confidence, not a field guarantee.', assessments }
writeFileSync(file.replace(/\.json$/, '-assessment.json'), `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result, null, 2))
