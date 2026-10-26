import { expect } from '@playwright/test'

export async function expectSelectionDisabled(page, selector = 'body') {
  await expect.poll(() => page.locator(selector).evaluate(el => {
    const property = CSS.supports('user-select', 'none') ? 'user-select' : '-webkit-user-select'

    return getComputedStyle(el).getPropertyValue(property)
  })).toBe('none')
}

export async function expectSelectionCleared(page, selector = 'body') {
  expect(await page.locator(selector).evaluate(el => [
    el.style.getPropertyValue('user-select'),
    el.style.getPropertyValue('-webkit-user-select'),
  ])).toEqual(['', ''])
}
