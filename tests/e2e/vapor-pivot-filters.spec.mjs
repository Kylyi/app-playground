import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'
import { captureState } from '../visual/capture-state.mjs'

assertRendererDiagnostics(test)

test('Pivot applies edited values and comparator changes while its filter menu remains open', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-pivot-filters')
  await expect(page.getByTestId('pivot-filters-example')).toHaveAttribute('data-ready', 'true')
  const pivot = page.getByTestId('filters-pivot')
  const rows = pivot.locator('.pivot-content__rows .pivot-row-item:not(.is-grand-total)')
  await expect(rows).toContainText(['Alpha', 'Beta', 'Gamma'])
  await pivot.locator('[data-pivot-row="team"] .pivot-filter-btn').click()
  const menu = page.locator('.menu').filter({ has: page.locator('.pivot-filter-menu') })
  await expect(menu).toBeVisible()
  await menu.locator('[data-cy="qb-item__content-value"] input').fill('Alpha')
  await expect(rows).toContainText(['Alpha'])
  await expect(rows).toHaveCount(1)
  await captureState({ page, testInfo, target: menu, state: 'pivot-live-filter', families: ['Pivot', 'Inputs', 'Selector', 'Menu'] })
  await menu.locator('[data-cy="comparator"] .control').click()
  await page.locator('.selector-menu').getByText('Nerovná se', { exact: true }).click()
  await expect(rows).toContainText(['Beta', 'Gamma'])
  await expect(rows).toHaveCount(2)
  await expect(menu).toBeVisible()
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).evaluate(element => element.click())
  await expect(page.locator('.menu')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(rows).toHaveCount(2)
})

test('Pivot filters render rows and a localized navigation link without JavaScript', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto('/cs-CZ/vapor-pivot-filters')
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('filters-pivot')).toContainText('Alpha')
    await expect(page.getByRole('link', { name: 'Pivot · živé filtrování', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-pivot-filters')
  } finally {
    await context.close()
  }
})
