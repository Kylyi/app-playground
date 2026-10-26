import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

test('Pivot worker data renders after initially empty fallback and survives repeated remounts', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-pivot-worker')
  await expect(page.getByTestId('pivot-worker-example')).toHaveAttribute('data-ready', 'true')
  const pivot = page.getByTestId('worker-pivot')
  await expect(pivot).toContainText('Worker record 0')
  for (let revision = 1; revision <= 3; revision++) {
    await page.getByRole('button', { name: 'Toggle worker Pivot', exact: true }).click()
    await expect(pivot).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle worker Pivot', exact: true }).click()
    await expect(pivot.locator('.pivot-content')).toBeVisible()
    await expect(pivot).toContainText('Worker record 0')
    await page.getByRole('button', { name: 'Replace worker Pivot data', exact: true }).click()
    await expect(pivot).toContainText(`Worker record 0 revision ${revision}`)
  }
})

test('Pivot worker input renders matching SSR records and localized navigation', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-pivot-worker')
    await expect(page.getByTestId('worker-pivot')).toContainText('Worker record 0')
    await expect(page.getByRole('link', { name: 'Pivot · worker a remount', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-pivot-worker')
  } finally {
    await context.close()
  }
})
