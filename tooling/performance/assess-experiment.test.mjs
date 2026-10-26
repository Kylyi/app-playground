import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(new URL('./assess-experiment.mjs', import.meta.url))

function fixture(delta) {
  return {
    families: ['tree'],
    retentionFailures: [],
    samples: ['vdom', 'vapor'].flatMap(compiler => ['before', 'after'].flatMap(phase => {
      return Array.from({ length: 64 }, (_, trial) => ({
        renderer: `${phase}-${compiler}`,
        family: 'tree',
        trial,
        rows: 24,
        mount: { contentReady: 20 + (phase === 'after' ? delta : 0) },
      }))
    })),
  }
}

function withReport(report, run) {
  const directory = mkdtempSync(join(tmpdir(), 'vapor-experiment-'))
  const file = join(directory, 'results.json')
  try {
    writeFileSync(file, JSON.stringify(report))
    run(file)
  } finally {
    rmSync(directory, { recursive: true })
  }
}

for (const delta of [-2, -0.2, -0.1, 0, 2]) {
  test(`paired bootstrap has the known constant delta ${delta}`, () => {
    withReport(fixture(delta), file => {
      execFileSync(process.execPath, [script, file])
      const assessment = JSON.parse(readFileSync(file.replace('.json', '-assessment.json'))).assessments[0]
      assert.equal(assessment.measuredNativeImprovement, delta <= -0.2)
      for (const compiler of ['vdom', 'vapor']) {
        for (const value of [assessment[compiler].pairedMedianDelta, ...assessment[compiler].pairedMedianDelta95CI]) {
          assert.ok(Math.abs(value - delta) < 1e-9)
        }
        assert.equal(assessment[compiler].beforeMedian, 20)
        assert.equal(assessment[compiler].afterMedian, 20 + delta)
      }
    })
  })
}

test('different row counts cannot qualify as a measured improvement', () => {
  const report = fixture(-2)
  report.samples.find(sample => sample.renderer === 'after-vapor').rows--
  withReport(report, file => {
    assert.notEqual(spawnSync(process.execPath, [script, file]).status, 0)
  })
})
