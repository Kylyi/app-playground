import { expect, test } from '@playwright/test'

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
