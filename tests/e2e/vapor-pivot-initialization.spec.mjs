import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

for (const mode of ['static', 'immediate', 'deferred']) {
  test(`Pivot preserves ${mode} initial data through SSR and hydration`, async ({ page, browser, baseURL }) => {
    const url = `/cs-CZ/vapor-table-pivot-dom${mode === 'static' ? '' : `?loading=${mode}`}`
    const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
    try {
      const serverPage = await context.newPage()
      expect((await serverPage.goto(url)).status()).toBe(200)
      await expect(serverPage.locator('.pivot-loading.is-initial')).toBeVisible()
      if (mode === 'deferred') {
        await expect(serverPage.locator('.pivot-content')).toHaveCount(0)
      } else {
        await expect(serverPage.locator('.pivot-content')).toHaveCount(1)
        await expect(serverPage.locator('.pivot-row-item').first()).toContainText('Item 0')
        await expect(serverPage.locator('.pivot-value-item-cell').first()).toHaveText('1')
      }
    } finally {
      await context.close()
    }

    await page.goto(url)
    await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
    await expect(page.locator('.pivot-loading')).toHaveCount(0)
    await expect(page.locator('.pivot-content')).toHaveCount(1)
    await expect(page.locator('.pivot-row-item').first()).toContainText('Item 0')
    await expect(page.locator('.pivot-value-item-cell').first()).toHaveText('1')
    await page.getByRole('button', { name: 'Toggle tables', exact: true }).click()
    await expect(page.locator('.pivot')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle tables', exact: true }).click()
    await expect(page.locator('.pivot-content')).toHaveCount(1)
    await expect(page.locator('.pivot-row-item').first()).toContainText('Item 0')
    await expect(page.locator('.pivot-loading')).toHaveCount(0)
  })
}
