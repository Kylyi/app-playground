import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'
import { assertTableCellSlots } from './table-cell-contracts.mjs'

assertRendererDiagnostics(test)

test('Table preserves provided-empty slot fallbacks, dynamic slots and card rows', async ({ page, browser, baseURL }) => {
  const path = '/cs-CZ/vapor-table-measurement?slot=empty'
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const server = await context.newPage()
    await server.goto(path)
    await expect(server.getByTestId('measured-table').locator('.td[data-field="width"]')).toHaveText(['123', '287'])
    const link = server.getByRole('link', { name: 'Table · prázdný vlastní slot', exact: true })
    await expect(link).toHaveAttribute('href', path)
    await link.click()
    await expect(server.getByTestId('measured-table').locator('.td[data-field="width"]')).toHaveText(['123', '287'])
  } finally {
    await context.close()
  }
  await page.goto(path)
  await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByTestId('measured-table').locator('.td[data-field="width"]')).toHaveText(['123', '287'])
  await page.getByRole('button', { name: 'Toggle cell slot content', exact: true }).click()
  await assertTableCellSlots(page)
})

test('Table switches between a conditional cell slot and its formatted fallback without remounting', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-table-measurement')
  const table = page.getByTestId('measured-table')
  await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-ready', 'true')
  for (let cycle = 0; cycle < 3; cycle++) {
    await expect(table.locator('[data-slot-contract]')).toHaveCount(2)
    await expect(table.locator('[data-slot-contract="width:287:1:object"]')).toBeVisible()
    await page.getByRole('button', { name: 'Toggle custom cell slot', exact: true }).click()
    await expect(table.locator('[data-slot-contract]')).toHaveCount(0)
    await expect(table.locator('.tr .td[data-field="width"]')).toHaveText(['123', '287'])
    await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-active', '0')
    await page.getByRole('button', { name: 'Toggle custom cell slot', exact: true }).click()
  }
})

test('concurrent native Vapor cell measurements preserve local providers and clean up', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-table-measurement')
  await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-active', '2')
  for (let index = 0; index < 2; index++) {
    if (index) {
      await page.getByRole('button', { name: 'Increase content width', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Measure concurrent cells', exact: true }).click()
    await expect(page.getByTestId('measurement-result')).toHaveAttribute('data-runs', String(index + 1))
    const result = JSON.parse(await page.getByTestId('measurement-result').textContent())
    expect(result.widths).toEqual([123 + index * 50, 287 + index * 50])
    for (const width of [result.header, result.plain, result.boolean]) {
      expect(width).toBeGreaterThan(0)
    }
    await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
    await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-active', '2')
  }
  await page.evaluate(() => {
    const original = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function () {
      if (this.hasAttribute('data-table-measurement')) {
        Element.prototype.getBoundingClientRect = original
        throw new Error('Measurement failed')
      }

      return original.call(this)
    }
  })
  await page.getByRole('button', { name: 'Measure concurrent cells', exact: true }).click()
  await expect(page.getByTestId('measurement-result')).toHaveAttribute('data-runs', '3')
  await expect(page.getByTestId('measurement-result')).toHaveText('Measurement failed')
  await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
  expect(problems).toEqual([])
})

test('native measurement is inactive during SSR and has localized navigation', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-table-measurement')
    await expect(page.getByTestId('measurement-result')).toHaveText('pending')
    await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Table · měření buněk', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-table-measurement')
    await expect(page.getByRole('link', { name: 'Table · autofit při načtení', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-table-measurement?mode=autofit')
    await expect(page.locator('[data-slot-contract="width:287:1:object"]')).toHaveCount(1)
    await page.goto('/cs-CZ/vapor-table-measurement?mode=autofit')
    await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
    expect(await page.locator('.th[data-column="width"]').evaluate(element =>
      element.getBoundingClientRect().width,
    )).toBe(90)
  } finally {
    await context.close()
  }
})

test('Table autofit measures native slots, text and checkbox cells after updates and remount', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-table-measurement')
  const root = page.getByTestId('table-measurement')
  const table = page.getByTestId('measured-table')
  const widths = () => table.locator('.th[data-column]').evaluateAll(elements =>
    Object.fromEntries(elements.map(element => [element.dataset.column, element.getBoundingClientRect().width])),
  )
  await expect(root).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Fit table', exact: true }).click()
  await expect(page.getByTestId('fit-state')).toHaveText('fitted')
  const initial = await widths()
  expect(initial.width).toBe(304)
  expect(initial.text).toBeGreaterThan(100)
  expect(initial.enabled).toBeGreaterThan(40)
  await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
  await expect(root).toHaveAttribute('data-active', '2')

  await page.getByRole('button', { name: 'Increase content width', exact: true }).click()
  // Double-clicking a real column splitter must use the same native measurement path.
  await table.locator('.splitter:not(.splitter--active)').first().dblclick()
  await expect.poll(async () => (await widths()).width).toBe(354)
  await expect(page.locator('[data-table-measurement]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Fit and remove table', exact: true }).click()
  await expect(page.getByTestId('fit-state')).toHaveText('removed')
  await expect(table.locator('.th')).toHaveCount(0)
  await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
  await expect(root).toHaveAttribute('data-measurement-active', '0')
  await expect(root).toHaveAttribute('data-active', '0')
  await page.getByRole('button', { name: 'Toggle table', exact: true }).click()
  await page.getByRole('button', { name: 'Fit table', exact: true }).click()
  await expect(page.getByTestId('fit-state')).toHaveText('fitted')
  expect((await widths()).width).toBe(354)
  await expect(root).toHaveAttribute('data-measurement-active', '0')
  await expect(root).toHaveAttribute('data-active', '2')
  await page.getByRole('button', { name: 'Stretch and remove table', exact: true }).click()
  await expect(page.getByTestId('fit-state')).toHaveText('removed')
  const cancelled = JSON.parse(await page.getByTestId('cancelled-widths').textContent())
  expect(cancelled.before).toHaveLength(3)
  expect(cancelled.after).toEqual(cancelled.before)
  await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
  await expect(root).toHaveAttribute('data-active', '0')
  expect(problems).toEqual([])
})

test('forced initial autofit runs after hydration with native slots', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-table-measurement?mode=autofit')
  await expect.poll(() => page.locator('.th[data-column="width"]').evaluate(element =>
    element.getBoundingClientRect().width,
  )).toBe(304)
  await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
  await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-active', '2')
  expect(problems).toEqual([])
})

test('hydrated Table disposes visible native cell-slot components on removal', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-table-measurement')
  const root = page.getByTestId('table-measurement')
  await expect(root).toHaveAttribute('data-ready', 'true')
  for (let cycle = 0; cycle < 2; cycle++) {
    await expect(root).toHaveAttribute('data-active', '2')
    await page.getByRole('button', { name: 'Toggle table', exact: true }).click()
    await expect(page.getByTestId('measured-table').locator('.th')).toHaveCount(0)
    await expect(root).toHaveAttribute('data-active', '0')
    if (cycle === 0) {
      await page.getByRole('button', { name: 'Toggle table', exact: true }).click()
    }
  }
})
