import { expect, test } from '@playwright/test'

test('concurrent VDOM cell measurements from Vapor use independent roots and clean up', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-table-measurement')
  await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-ready', 'true')
  for (let index = 0; index < 2; index++) {
    await page.getByRole('button', { name: 'Measure concurrent cells', exact: true }).click()
    await expect(page.getByTestId('measurement-result')).toHaveAttribute('data-runs', String(index + 1))
    const result = JSON.parse(await page.getByTestId('measurement-result').textContent())
    expect(result.widths).toEqual([123, 287])
    for (const width of [result.header, result.plain, result.boolean]) {
      expect(width).toBeGreaterThan(0)
    }
    await expect(page.locator('[data-ui-temp-component]')).toHaveCount(0)
  }
  await page.evaluate(() => {
    const original = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function () {
      if (this.hasAttribute('data-ui-temp-component')) {
        Element.prototype.getBoundingClientRect = original
        throw new Error('Measurement failed')
      }

      return original.call(this)
    }
  })
  await page.getByRole('button', { name: 'Measure concurrent cells', exact: true }).click()
  await expect(page.getByTestId('measurement-result')).toHaveAttribute('data-runs', '3')
  await expect(page.getByTestId('measurement-result')).toHaveText('Measurement failed')
  await expect(page.locator('[data-ui-temp-component]')).toHaveCount(0)
  expect(problems).toEqual([])
})

test('temporary renderer is safe during SSR and example has localized navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-table-measurement')
    await expect(page.getByTestId('measurement-result')).toHaveText('pending')
    await expect(page.locator('[data-ui-temp-component]')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Table · měření buněk', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-table-measurement')
  } finally {
    await context.close()
  }
})
