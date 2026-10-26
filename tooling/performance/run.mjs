import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { cpus, loadavg, platform, release, totalmem } from 'node:os'
import { resolve } from 'node:path'
import process from 'node:process'
import { chromium, expect, firefox, webkit } from '@playwright/test'
import { observeRendererDiagnostics } from '../../tests/e2e/renderer-diagnostics.mjs'
import { experiment, families, rowSelectors, variants } from './variants.mjs'
import { verifyButtonDirectives } from './contracts.mjs'

const output = process.env.VAPOR_PERFORMANCE_REPORT ?? '/tmp/vapor-performance.json'
const warmups = experiment ? 8 : 5
const trials = experiment ? 64 : 32
const renderers = Object.keys(variants)
const selectedFamilies = (process.env.VAPOR_PERFORMANCE_FAMILIES ?? families.join(',')).split(',')
assert.ok(selectedFamilies.every(family => families.includes(family)))
const initialRows = process.env.VAPOR_PERFORMANCE_INITIAL_ROWS
assert.ok(!initialRows || /^[1-9]\d*$/.test(initialRows))
const report = {
  recordedAt: new Date().toISOString(),
  baseline: experiment ?? JSON.parse(readFileSync(resolve(import.meta.dirname, '../../.cache/vapor-performance-baseline/baseline.json'))),
  currentVDOMControl: experiment ? undefined : JSON.parse(readFileSync(resolve(import.meta.dirname, '../../.cache/vapor-performance-current-vdom/source.json'))),
  runtime: Object.fromEntries(['nuxt', 'vue'].map(name => [
    name,
    JSON.parse(readFileSync(resolve(import.meta.dirname, '../../node_modules', name, 'package.json'))).version,
  ])),
  environment: {
    platform: platform(),
    release: release(),
    cpu: cpus()[0].model,
    logicalCpuCount: cpus().length,
    totalMemory: totalmem(),
    loadAverageStart: loadavg(),
  },
  method: experiment
    ? 'Frozen before/after source, each compiled as VDOM and Vapor; same canonical fixture and 2,000 records; 8 warmups, 64 trials in two 32-trial blocks; rotating first variant; Chromium memory after forced GC'
    : 'Same canonical fixture and 2,000 records; old VDOM, current VDOM, mixed owner, Vapor owner; 5 warmups, 32 trials, rotating first variant; Chromium memory after forced GC',
  variants,
  families: selectedFamilies,
  initialRows: initialRows ? Number(initialRows) : 'library-default',
  builds: {},
  comparisonControls: {},
  correctness: [],
  domParity: [],
  directiveContracts: [],
  samples: [],
  memory: [],
  retentionFailures: [],
  scroll: [],
  bundles: {},
}

async function verify(page, options) {
  const query = new URLSearchParams({ family: options.family })
  if (initialRows) {
    query.set('initialRows', initialRows)
  }
  await page.goto(`${variants[options.renderer].url}/?${query}`)
  await expect(page.locator('main')).toHaveAttribute('data-renderer', options.renderer)
  await expect(page.locator('main')).toHaveAttribute('data-parent', variants[options.renderer].parent)
  if (options.javascript) {
    await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
  }
  if (options.renderer === 'vdom' && options.family === 'tree' && !options.javascript) {
    // The actual pre-migration Tree renders No data on the server. Record this
    // baseline defect explicitly; current Vapor SSR must render its rows.
    await expect(page.getByTestId('benchmark-surface')).toContainText('No data')

    return 'baseline-missing-SSR-rows'
  }
  await expect(page.getByTestId('benchmark-surface')).toContainText('Record 0')
}

async function snapshotRows(page, family) {
  // Firefox does not drain page-promise jobs with JavaScript disabled. Poll
  // the synchronous status from the host so no-JS SSR checks can finish.
  await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded')

  return page.getByTestId('benchmark-surface').evaluate((surface, selectors) => {
    function describe(element) {
      const rect = element.getBoundingClientRect()

      return {
        tag: element.tagName,
        size: [rect.width, rect.height].map(value => Math.round(value * 100) / 100),
        classes: [...element.classList].sort(),
        attributes: [...element.attributes]
          .filter(attribute => !['class', 'style'].includes(attribute.name)
            && !attribute.name.startsWith('data-v-'))
          .map(attribute => [attribute.name, attribute.value])
          .sort(),
        text: element.children.length ? undefined : element.textContent,
        children: [...element.children].map(describe),
      }
    }

    return selectors.map(selector => ({
      count: surface.querySelectorAll(selector).length,
      rows: [...surface.querySelectorAll(selector)].slice(0, 2).map(describe),
    }))
  }, family === 'pivot' ? ['.pivot-row-item', '.pivot-value-item'] : [rowSelectors[family]])
}

async function run() {
  for (const [file, sha256] of Object.entries(report.currentVDOMControl?.sources ?? {})) {
    if (/\.(?:vue|ts|js|mjs|json|scss|css)$/.test(file)) {
      const live = readFileSync(resolve(import.meta.dirname, '../../packages', file))
      assert.equal(createHash('sha256').update(live).digest('hex'), sha256, `${file} must match the diagnostic copy`)
    }
  }
  if (experiment) {
    for (const [name, variant] of Object.entries(variants)) {
      const original = JSON.parse(readFileSync(resolve(variant.source, 'source.json'), 'utf8'))
      assert.equal(original.sha256, variant.sourceSha256, `${name} source identity`)
      const control = variant.compiler === 'vdom'
        ? JSON.parse(readFileSync(resolve(variant.layers, 'source.json'), 'utf8'))
        : original
      assert.deepEqual(control.sources, original.sources, `${name} compiler-only copy`)
      if (variant.compiler === 'vdom') {
        assert.equal(control.rendererAdapters?.length, 2, `${name} must select matching directive lifecycles`)
        for (const [file, sha256] of Object.entries(control.preparedSources)) {
          assert.equal(createHash('sha256').update(readFileSync(resolve(variant.layers, file))).digest('hex'), sha256)
        }
        report.comparisonControls[name] = {
          sourceSha256: control.sha256,
          preparedSha256: createHash('sha256').update(JSON.stringify(control.preparedSources)).digest('hex'),
          rendererAdapters: control.rendererAdapters,
        }
      }
      for (const [file, sha256] of Object.entries(original.sources)) {
        assert.equal(createHash('sha256').update(readFileSync(resolve(variant.source, file))).digest('hex'), sha256)
      }
    }
  }
  for (const renderer of renderers) {
    const response = await fetch(`${variants[renderer].url}/_nuxt/benchmark-build.json`)
    assert.equal(response.status, 200)
    const build = await response.json()
    assert.equal(build.variant, renderer)
    assert.equal(build.parent, variants[renderer].parent)
    assert.equal(build.root, 'vdom')
    if (experiment) {
      assert.equal(build.sourceSha256, variants[renderer].sourceSha256)
      if (variants[renderer].compiler === 'vdom') {
        assert.equal(build.preparedSourceSha256, report.comparisonControls[renderer].preparedSha256)
      }
      assert.equal(build.nativeUI.length, variants[renderer].compiler === 'vapor' ? 242 : 0)
    }
    report.builds[renderer] = build
  }
  assert.equal(new Set(Object.values(report.builds).map(build => build.fixtureSha256)).size, 1)
  // Timing is collected only after cross-browser SSR/hydration correctness has
  // passed, and with no concurrent validation jobs owned by this task.
  for (const [browserName, browserType] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await browserType.launch({ headless: true })
    try {
      for (const javascript of [false, true]) {
        const context = await browser.newContext({ javaScriptEnabled: javascript, viewport: { width: 1280, height: 900 } })
        try {
          const page = await context.newPage()
          const diagnostics = observeRendererDiagnostics(page)
          const snapshots = new Map()
          for (const renderer of renderers) {
            for (const family of selectedFamilies) {
              const before = diagnostics.length
              console.log(`Verify ${browserName}/${renderer}/${family}/${javascript ? 'hydration' : 'SSR'}`)
              const baselineLimitation = await verify(page, { renderer, family, javascript })
              if (renderer === 'vdom' && ['tree', 'pivot'].includes(family) && javascript) {
                assert.deepEqual(diagnostics.slice(before), ['Hydration completed but contains mismatches.'])
              } else {
                assert.deepEqual(diagnostics.slice(before), [])
              }
              report.correctness.push({ browser: browserName, renderer, family, javascript, passed: !baselineLimitation && !(renderer === 'vdom' && ['tree', 'pivot'].includes(family) && javascript), baselineLimitation: baselineLimitation ?? (renderer === 'vdom' && ['tree', 'pivot'].includes(family) && javascript ? `baseline-${family}-hydration-mismatch` : undefined) })
              if (experiment) {
                const signature = await snapshotRows(page, family)
                const compiler = variants[renderer].compiler
                const key = `${compiler}/${family}`
                if (renderer.startsWith('before-')) {
                  snapshots.set(key, signature)
                } else {
                  assert.deepEqual(signature, snapshots.get(key), `${renderer}/${family} before/after DOM parity`)
                  report.domParity.push({ browser: browserName, renderer, family, javascript, passed: true })
                }
                if (javascript && family === 'tree') {
                  await verifyButtonDirectives(page)
                  assert.deepEqual(diagnostics.slice(before), [])
                  report.directiveContracts.push({ browser: browserName, renderer, passed: true })
                }
              }
            }
          }
        } finally {
          await context.close()
        }
      }
    } finally {
      await browser.close()
    }
  }

  const browser = await chromium.launch({ headless: true, args: ['--enable-precise-memory-info'] })
  report.environment.browser = browser.version()
  try {
    for (const family of selectedFamilies) {
      const contexts = new Map()
      for (const renderer of renderers) {
        const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
        const page = await context.newPage()
        const diagnostics = observeRendererDiagnostics(page)
        await verify(page, { renderer, family, javascript: true })
        if (renderer === 'vdom' && ['tree', 'pivot'].includes(family)) {
          assert.deepEqual(diagnostics, ['Hydration completed but contains mismatches.'])
          diagnostics.length = 0
        }
        contexts.set(renderer, { context, page, diagnostics })
      }
      try {
        for (let trial = -warmups; trial < trials; trial++) {
        // Every four measured trials put each variant in every order position.
          const first = ((trial % renderers.length) + renderers.length) % renderers.length
          const order = [...renderers.slice(first), ...renderers.slice(0, first)]
          for (const renderer of order) {
            const { page, diagnostics } = contexts.get(renderer)
            const remove = await page.evaluate(() => window.gentlBenchmark.measure('remove'))
            const renderedRows = page.getByTestId('benchmark-surface').locator(rowSelectors[family])
            await expect(renderedRows).toHaveCount(0)
            const mount = await page.evaluate(() => window.gentlBenchmark.measure('mount'))
            await expect(page.getByTestId('benchmark-surface')).toContainText('Record 0')
            const renderedRowCount = await renderedRows.count()
            assert.ok(renderedRowCount > 0, `${renderer}/${family} must render real rows`)
            const update = await page.evaluate(() => window.gentlBenchmark.measure('update'))
            await expect(page.getByTestId('benchmark-surface')).toContainText(`update ${trial + warmups + 1}`)
            assert.deepEqual(diagnostics, [])
            if (trial >= 0) {
              report.samples.push({ renderer, family, trial, mount, update, remove, rows: renderedRowCount, nodes: await page.getByTestId('benchmark-surface').locator('*').count() })
            }
          }
        }
        for (const renderer of renderers) {
          const { page, diagnostics } = contexts.get(renderer)
          const session = await page.context().newCDPSession(page)
          await page.evaluate(() => window.gentlBenchmark.measure('remove'))
          await session.send('HeapProfiler.collectGarbage')
          const before = { heap: await session.send('Runtime.getHeapUsage'), dom: await session.send('Memory.getDOMCounters') }
          const checkpoints = []
          const cycles = []
          for (let cycle = 0; cycle < 30; cycle++) {
            const timings = await page.evaluate(async () => {
              const mount = await window.gentlBenchmark.measure('mount')
              const remove = await window.gentlBenchmark.measure('remove')

              return { mount, remove }
            })
            cycles.push({ cycle: cycle + 1, ...timings })
            if ((cycle + 1) % 10 === 0) {
              await session.send('HeapProfiler.collectGarbage')
              checkpoints.push({ cycle: cycle + 1, heap: await session.send('Runtime.getHeapUsage'), dom: await session.send('Memory.getDOMCounters') })
            }
          }
          report.memory.push({ renderer, family, before, checkpoints, cycles })
          if (renderer !== 'vdom') {
            const warm = checkpoints[0].dom
            const final = checkpoints.at(-1).dom
            if (final.jsEventListeners !== warm.jsEventListeners || final.nodes > warm.nodes) {
              // Finish the matrix so a failing family does not conceal other
              // regressions. The run still fails after saving every result.
              report.retentionFailures.push({ renderer, family, warm, final })
            }
          }
          await page.evaluate(() => window.gentlBenchmark.measure('mount'))
          if (family !== 'selector') {
            const scroll = await page.getByTestId('benchmark-surface').evaluate(async surface => {
              const target = [...surface.querySelectorAll('*')].find(element => {
                return element.scrollHeight > element.clientHeight + 100
                  && ['auto', 'scroll'].includes(getComputedStyle(element).overflowY)
                  && element.clientHeight > 100
              })
              if (!target) {
                return { unavailable: true }
              }
              const initial = surface.textContent
              const frames = []
              let previous = performance.now()
              for (let step = 0; step < 30; step++) {
                target.scrollTop = (target.scrollHeight - target.clientHeight) * step / 29
                await new Promise(resolve => requestAnimationFrame(resolve))
                const now = performance.now()
                frames.push(now - previous)
                previous = now
              }

              return { frames, changed: surface.textContent !== initial, scrollTop: target.scrollTop, height: target.scrollHeight, nodes: surface.querySelectorAll('*').length }
            })
            assert.equal(scroll.unavailable, undefined, `${renderer}/${family} needs a real scrollable surface`)
            assert.equal(scroll.changed, true, `${renderer}/${family} scroll must change rendered rows`)
            report.scroll.push({ renderer, family, ...scroll })
          }
          assert.deepEqual(diagnostics, [])
          await session.detach()
        }
      } finally {
        for (const { context } of contexts.values()) {
          await context.close()
        }
      }
      writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
      console.log(`Measured ${family}`)
    }
  } finally {
    await browser.close()
  }

  for (const renderer of renderers) {
    const directory = resolve(import.meta.dirname, '.output', renderer, 'public')
    const files = assetFiles(directory).map(file => ({
      file: file.slice(directory.length + 1),
      bytes: statSync(file).size,
      gzipBytes: gzipSync(readFileSync(file)).length,
    }))
    report.bundles[renderer] = {
      files: files.length,
      bytes: files.reduce((total, file) => total + file.bytes, 0),
      gzipBytes: files.reduce((total, file) => total + file.gzipBytes, 0),
      assets: files,
    }
  }
  report.environment.loadAverageEnd = loadavg()
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Saved ${report.correctness.length} correctness checks and ${report.samples.length} performance samples to ${output}`)
  assert.deepEqual(report.retentionFailures, [], 'Current variants must release remount DOM and listeners')
}

void run().catch(error => {
  report.failure = error.message
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
  console.error(error)
  process.exitCode = 1
})

function assetFiles(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = resolve(directory, name)

    return statSync(path).isDirectory() ? assetFiles(path) : /\.(?:js|css)$/.test(name) ? [path] : []
  })
}
