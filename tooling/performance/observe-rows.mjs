import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { chromium, expect } from '@playwright/test'
import { observeRendererDiagnostics } from '../../tests/e2e/renderer-diagnostics.mjs'
import { rowSelectors, variants } from './variants.mjs'

// DOM interception deliberately runs separately from all timing/profiling.
// Keep even detached clones until classification so slot probes are counted.
const report = []
async function run() {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const family of ['table', 'tree', 'pivot', 'scroller']) {
      for (const [renderer, variant] of Object.entries(variants)) {
        for (const initialRows of family === 'pivot' ? ['library-default'] : ['library-default', 12]) {
          const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
          try {
            const page = await context.newPage()
            const diagnostics = observeRendererDiagnostics(page)
            await page.goto(`${variant.url}/?family=${family}${initialRows === 12 ? '&initialRows=12' : ''}`)
            await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
            assert.deepEqual(diagnostics, renderer === 'vdom' && ['tree', 'pivot'].includes(family)
              ? ['Hydration completed but contains mismatches.']
              : [])
            diagnostics.length = 0
            await page.evaluate(() => window.gentlBenchmark.measure('remove'))
            const counts = await page.getByTestId('benchmark-surface').evaluate(async (surface, selector) => {
              const candidates = new Set()
              const inserted = new Set()
              const collect = (node, target) => {
                if (node instanceof Element) {
                  target.add(node)
                }
                node.querySelectorAll?.('*').forEach(element => target.add(element))
              }
              const consume = records => {
                for (const record of records) {
                  for (const node of [...record.addedNodes, ...record.removedNodes]) {
                    collect(node, inserted)
                  }
                }
              }
              const clone = Node.prototype.cloneNode
              const create = Document.prototype.createElement
              Node.prototype.cloneNode = function (...args) {
                const result = Reflect.apply(clone, this, args)
                collect(result, candidates)

                return result
              }
              Document.prototype.createElement = function (...args) {
                const result = Reflect.apply(create, this, args)
                collect(result, candidates)

                return result
              }
              const observer = new MutationObserver(consume)
              observer.observe(surface, { childList: true, subtree: true })
              try {
                await window.gentlBenchmark.measure('mount')
                consume(observer.takeRecords())

                return {
                  constructedRows: [...candidates].filter(element => element.matches(selector)).length,
                  insertedRows: [...inserted].filter(element => element.matches(selector)).length,
                  remainingRows: surface.querySelectorAll(selector).length,
                  ...(selector.includes('pivot')
                    ? {
                        constructedCells: [...candidates].filter(element => element.matches('.pivot-value-item-cell')).length,
                        insertedCells: [...inserted].filter(element => element.matches('.pivot-value-item-cell')).length,
                        remainingCells: surface.querySelectorAll('.pivot-value-item-cell').length,
                      }
                    : {}),
                }
              } finally {
                observer.disconnect()
                Node.prototype.cloneNode = clone
                Document.prototype.createElement = create
              }
            }, family === 'pivot' ? '.pivot-row-item, .pivot-value-item' : rowSelectors[family])
            assert.ok(counts.constructedRows >= counts.remainingRows && counts.remainingRows > 0)
            assert.deepEqual(diagnostics, [])
            report.push({ family, renderer, initialRows, ...counts })
          } finally {
            await context.close()
          }
        }
      }
    }
  } finally {
    await browser.close()
  }
  writeFileSync(process.env.VAPOR_ROW_REPORT ?? '/tmp/vapor-rows.json', `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
}

void run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
