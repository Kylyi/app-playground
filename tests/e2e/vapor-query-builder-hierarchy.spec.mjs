import { expect, test } from '@playwright/test'

test.describe.configure({ timeout: 120_000 })

async function waitForHydration(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => resolve())))
  await expect(page.getByTestId('query-builder-dom')).toHaveAttribute('data-ready', 'true', { timeout: 60_000 })
}

test('hierarchical QueryBuilder remains responsive during repeated drag movement', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-query-builder-dom')
  await waitForHydration(page)
  await expect(page.locator('.query-builder .qb-item')).toHaveCount(24)
  await expect(page.locator('.query-builder .qb-group')).toHaveCount(4)
  const source = await page.locator('.qb-item[data-path="0.children.0"] .query-builder-move-handler').boundingBox()
  const target = await page.locator('.qb-item[data-path="0.children.4"]').boundingBox()
  await page.mouse.move(source.x + 5, source.y + 5)
  await page.mouse.down()
  await expect(page.locator('body > .qb-item')).toHaveCount(1)

  await page.evaluate(() => {
    window.queryDragTimings = []
    let previous
    window.queryDragFrame = requestAnimationFrame(function measure(now) {
      if (previous !== undefined) {
        window.queryDragTimings.push(now - previous)
      }
      previous = now
      window.queryDragFrame = requestAnimationFrame(measure)
    })
  })
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.mouse.move(target.x + 100, target.y + target.height - 4, { steps: 20 })
    await page.mouse.move(source.x + 50, source.y + 20, { steps: 20 })
  }
  const samples = await page.evaluate(() => {
    cancelAnimationFrame(window.queryDragFrame)

    return window.queryDragTimings
  })
  await page.keyboard.press('Escape')
  await page.mouse.up()
  const sorted = samples.toSorted((a, b) => a - b)
  const timings = {
    frames: sorted.length,
    p95: sorted[Math.floor(sorted.length * 0.95)],
    max: sorted.at(-1),
    over100ms: samples.filter(value => value > 100).length,
  }
  await testInfo.attach('drag-frame-timings', { body: JSON.stringify(timings, null, 2), contentType: 'application/json' })
  console.log('QueryBuilder drag frames:', timings)
  // A generous interaction budget catches repeated stalls, not isolated startup/GC noise.
  expect(timings.p95).toBeLessThan(100)
  expect(errors).toEqual([])
})

test('moving a two-digit sibling index between groups preserves every item and path', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-query-builder-dom')
  await waitForHydration(page)
  const source = page.locator('.qb-item[data-path="0.children.10"] .query-builder-move-handler')
  await source.scrollIntoViewIfNeeded()
  const sourceBox = await source.boundingBox()
  await page.mouse.move(sourceBox.x + 5, sourceBox.y + 5)
  await page.mouse.down()
  const destination = page.locator('.qb-group[data-path="0.children.12"] > .qb-group-row')
  await destination.scrollIntoViewIfNeeded()
  const target = await destination.boundingBox()
  await page.mouse.move(target.x + target.width / 2, target.y + 15, { steps: 10 })
  await page.mouse.up()
  const structure = JSON.parse(await page.getByTestId('query-structure').textContent())
  const root = structure[0]
  const platform = root.children.find(item => item.id === 'platform')
  expect(platform.children[0].id).toBe('Item 11')
  expect(root.children.some(item => item.id === 'Item 11')).toBe(false)
  expect(root.children[0].id).toBe('Alpha')
  const ids = []
  function checkPaths(rows, prefix = '') {
    rows.forEach((row, index) => {
      expect(row.path).toBe(`${prefix}${index}`)
      ids.push(row.id)
      if (row.children) {
        checkPaths(row.children, `${row.path}.children.`)
      }
    })
  }
  checkPaths(structure)
  expect(ids).toHaveLength(28)
  expect(new Set(ids).size).toBe(28)
  expect(errors).toEqual([])
})

test('a sibling at index 10 is a valid target and reordered rows retain their DOM', async ({ page }) => {
  await page.goto('/vapor-query-builder-dom')
  await waitForHydration(page)
  const sourceRow = page.locator('.qb-item[data-path="0.children.1"]')
  const retainedRow = await sourceRow.elementHandle()
  const handle = await sourceRow.locator('.query-builder-move-handler').boundingBox()
  await page.mouse.move(handle.x + 5, handle.y + 5)
  await page.mouse.down()
  const destination = page.locator('.qb-item[data-path="0.children.10"]')
  await destination.scrollIntoViewIfNeeded()
  const target = await destination.boundingBox()
  await page.mouse.move(target.x + 100, target.y + target.height - 4, { steps: 10 })
  await page.mouse.up()
  const structure = JSON.parse(await page.getByTestId('query-structure').textContent())
  expect(structure[0].children[10].id).toBe('Beta')
  expect(structure[0].children[9].id).toBe('Item 11')
  expect(await retainedRow.evaluate(el => el.isConnected && el.dataset.path === '0.children.10')).toBe(true)
})

test('a nested group moves with its entire subtree', async ({ page }) => {
  await page.goto('/vapor-query-builder-dom')
  await waitForHydration(page)
  const source = page.locator('.qb-group[data-path="0.children.12.children.4"] > .qb-group-row .query-builder-move-handler')
  await source.scrollIntoViewIfNeeded()
  const sourceBox = await source.boundingBox()
  await page.mouse.move(sourceBox.x + 5, sourceBox.y + 5)
  await page.mouse.down()
  const destination = page.locator('.qb-group[data-path="0.children.13"] > .qb-group-row')
  await destination.scrollIntoViewIfNeeded()
  const target = await destination.boundingBox()
  await page.mouse.move(target.x + target.width / 2, target.y + 15, { steps: 10 })
  await page.mouse.up()
  const structure = JSON.parse(await page.getByTestId('query-structure').textContent())
  const platform = structure[0].children.find(item => item.id === 'platform')
  const billing = structure[0].children.find(item => item.id === 'billing')
  expect(platform.children).toHaveLength(4)
  expect(billing.children[0].id).toBe('security')
  expect(billing.children[0].children.map(item => item.id)).toEqual(['Login', 'Roles', 'Sessions', 'Audit'])
  expect(billing.children[0].children[3].path).toBe('0.children.13.children.0.children.3')
  await expect(page.locator('.query-builder .qb-item')).toHaveCount(24)
  await expect(page.locator('.query-builder .qb-group')).toHaveCount(4)
})
