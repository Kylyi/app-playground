import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SourceMap } from 'node:module'
import process from 'node:process'
import { gzipSync } from 'node:zlib'
import { chromium, expect } from '@playwright/test'
import { observeRendererDiagnostics } from '../../tests/e2e/renderer-diagnostics.mjs'
import { families, variants } from './variants.mjs'

const directory = resolve(process.env.VAPOR_PROFILE_DIRECTORY ?? '.cache/vapor-parent-comparison-2026-10-22/profiles')
const renderers = Object.keys(variants)
const selectedFamilies = (process.env.VAPOR_PERFORMANCE_FAMILIES ?? families.join(',')).split(',')
assert.ok(selectedFamilies.every(family => families.includes(family)))
const trials = 20
const maps = new Map()
const report = {
  recordedAt: new Date().toISOString(),
  method: 'Separate diagnostic run: 5 warmups; 20 CPU profiles per family/variant at 100us sampling; traces of 5 remounts; hidden production source maps',
  warning: 'Sampling/tracing adds overhead. Use the uninstrumented run for performance comparisons; these profiles attribute work.',
  profiles: [],
  traces: [],
}
mkdirSync(directory, { recursive: true })

function resolveFrame(frame, renderer) {
  const url = frame.url
  if (!url.startsWith(variants[renderer].url) || frame.lineNumber < 0) {
    return { source: url || '(runtime)', line: frame.lineNumber + 1, name: frame.functionName || '(anonymous)' }
  }
  const path = new URL(url).pathname.slice(1)
  const key = `${renderer}/${path}`
  if (!maps.has(key)) {
    const raw = JSON.parse(readFileSync(resolve(import.meta.dirname, '.output', renderer, 'public', `${path}.map`)))
    maps.set(key, new SourceMap(raw))
  }
  const position = maps.get(key).findEntry(frame.lineNumber, frame.columnNumber)

  return {
    source: position.originalSource ?? path,
    line: (position.originalLine ?? frame.lineNumber) + 1,
    name: position.name ?? frame.functionName ?? '(anonymous)',
  }
}

function summarizeCPU(profiles, renderer) {
  const self = new Map()
  const inclusive = new Map()
  const sources = new Map()
  let sampledMs = 0
  for (const profile of profiles) {
    const nodes = new Map(profile.nodes.map(node => [node.id, node]))
    const parents = new Map(profile.nodes.flatMap(node => (node.children ?? []).map(id => [id, node.id])))
    const frames = new Map(profile.nodes.map(node => [node.id, resolveFrame(node.callFrame, renderer)]))
    for (const [index, id] of (profile.samples ?? []).entries()) {
      const ms = profile.timeDeltas[index] / 1000
      sampledMs += ms
      const frame = frames.get(id)
      const key = `${frame.source}:${frame.line} ${frame.name}`
      self.set(key, (self.get(key) ?? 0) + ms)
      sources.set(frame.source, (sources.get(frame.source) ?? 0) + ms)
      const seen = new Set()
      let ancestor = id
      while (nodes.has(ancestor)) {
        const parent = frames.get(ancestor)
        const label = `${parent.source}:${parent.line} ${parent.name}`
        if (!seen.has(label)) {
          inclusive.set(label, (inclusive.get(label) ?? 0) + ms)
          seen.add(label)
        }
        ancestor = parents.get(ancestor)
      }
    }
  }
  const entries = values => [...values].map(([location, ms]) => ({ location, ms, perMount: ms / profiles.length })).toSorted((left, right) => right.ms - left.ms)

  return { mounts: profiles.length, sampledMs, self: entries(self), inclusive: entries(inclusive), sources: entries(sources) }
}

async function captureTrace(session, page, destination) {
  const completed = new Promise(resolve => session.once('Tracing.tracingComplete', resolve))
  await session.send('Tracing.start', {
    categories: 'devtools.timeline,blink.user_timing,v8,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.stack,disabled-by-default-v8.cpu_profiler,disabled-by-default-v8.cpu_profiler.hires',
    transferMode: 'ReturnAsStream',
  })
  try {
    for (let cycle = 0; cycle < 5; cycle++) {
      await page.evaluate(async () => {
        await window.gentlBenchmark.measure('remove')
        await window.gentlBenchmark.measure('mount', true)
      })
    }
  } finally {
    await session.send('Tracing.end')
  }
  const { stream } = await completed
  const buffers = []
  try {
    let eof = false
    while (!eof) {
      const result = await session.send('IO.read', { handle: stream })
      buffers.push(Buffer.from(result.data, result.base64Encoded ? 'base64' : 'utf8'))
      eof = result.eof
    }
  } finally {
    await session.send('IO.close', { handle: stream })
  }
  const raw = Buffer.concat(buffers)
  writeFileSync(destination, gzipSync(raw))
  const { traceEvents: events } = JSON.parse(raw)
  const starts = events.filter(event => event.name === 'benchmark:mount:start')
  assert.equal(starts.length, 5)
  const timings = starts.map(start => {
    const ready = events.find(event => event.name === 'benchmark:mount:contentReady'
      && event.ts >= start.ts && event.pid === start.pid && event.tid === start.tid)
    assert.ok(ready)
    const work = events.filter(event => event.ph === 'X' && event.pid === start.pid
      && event.tid === start.tid && event.ts >= start.ts && event.ts < ready.ts)

    return {
      contentReady: (ready.ts - start.ts) / 1000,
      work: Object.fromEntries(['Layout', 'UpdateLayoutTree', 'RunMicrotasks', 'FunctionCall'].map(name => [name, {
        count: work.filter(event => event.name === name).length,
        ms: work.filter(event => event.name === name).reduce((sum, event) => sum + (event.dur ?? 0) / 1000, 0),
      }])),
    }
  })

  return { file: destination.slice(directory.length + 1), timings }
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  report.browser = browser.version()
  try {
    for (const family of selectedFamilies) {
      const contexts = new Map()
      const profiles = new Map(renderers.map(renderer => [renderer, []]))
      try {
        for (const renderer of renderers) {
          const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
          const page = await context.newPage()
          const diagnostics = observeRendererDiagnostics(page)
          contexts.set(renderer, { context, page, diagnostics })
          await page.goto(`${variants[renderer].url}/?family=${family}`)
          await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
          await expect(page.getByTestId('benchmark-surface')).toContainText('Record 0')
          assert.deepEqual(diagnostics, renderer === 'vdom' && ['tree', 'pivot'].includes(family)
            ? ['Hydration completed but contains mismatches.']
            : [])
          diagnostics.length = 0
          for (let warmup = 0; warmup < 5; warmup++) {
            await page.evaluate(async () => {
              await window.gentlBenchmark.measure('remove')
              await window.gentlBenchmark.measure('mount')
            })
          }
          const session = await context.newCDPSession(page)
          await session.send('Profiler.enable')
          await session.send('Profiler.setSamplingInterval', { interval: 100 })
          contexts.get(renderer).session = session
        }
        for (let trial = 0; trial < trials; trial++) {
          const first = trial % renderers.length
          for (const renderer of [...renderers.slice(first), ...renderers.slice(0, first)]) {
            const { page, session } = contexts.get(renderer)
            await page.evaluate(() => window.gentlBenchmark.measure('remove'))
            await session.send('Profiler.start')
            const timings = await page.evaluate(() => window.gentlBenchmark.measure('mount', true))
            const { profile } = await session.send('Profiler.stop')
            profiles.get(renderer).push(profile)
            const path = resolve(directory, renderer, family)
            mkdirSync(path, { recursive: true })
            writeFileSync(resolve(path, `${trial}.cpuprofile`), JSON.stringify(profile))
            report.profiles.push({ renderer, family, trial, timings })
          }
        }
        for (const renderer of renderers) {
          const { page, session, diagnostics } = contexts.get(renderer)
          await session.send('Profiler.disable')
          const trace = await captureTrace(session, page, resolve(directory, renderer, family, 'remounts.trace.json.gz'))
          report.traces.push({ renderer, family, ...trace, cpu: summarizeCPU(profiles.get(renderer), renderer) })
          assert.deepEqual(diagnostics, [])
        }
      } finally {
        for (const { context } of contexts.values()) {
          await context.close()
        }
      }
      writeFileSync(resolve(directory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
      console.log(`Profiled ${family}`)
    }
  } finally {
    await browser.close()
  }
  console.log(`Saved ${report.profiles.length} CPU profiles and ${report.traces.length} traces to ${directory}`)
}

void run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
