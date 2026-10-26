import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

test('a single selector option fits without a vertical scrollbar', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-query-builder-dom?small=true')
  await expect(page.getByTestId('query-builder-dom')).toHaveAttribute('data-ready', 'true')
  await page.locator('.qb-item__content-field').first().click()

  const content = page.locator('.selector-menu:visible .list-content')
  await expect(content.locator('.content-row')).toHaveCount(1)
  await expect.poll(() => content.evaluate(element => {
    return element.scrollHeight - element.clientHeight
  })).toBe(0)
})

test('clearing UI preferences keeps field editors usable', async ({ page, context }) => {
  await page.goto('/cs-CZ/vapor-query-builder-dom?small=true')
  await expect(page.getByTestId('query-builder-dom')).toHaveAttribute('data-ready', 'true')
  await context.clearCookies({ name: '__ui' })
  await page.locator('.qb-item__content-field').first().click()
  await expect(page.locator('.selector-menu:visible .content-row')).toHaveCount(1)
})
