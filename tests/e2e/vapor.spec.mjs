import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const browserErrors = new WeakMap()
test.beforeEach(async ({ page }) => {
  const errors = []
  browserErrors.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || (message.type() === 'warning' && /hydration/i.test(message.text()))) {
      errors.push(message.text())
    }
  })
})
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page), 'Browser errors and hydration warnings').toEqual([])
})

test('server renders content with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto(new URL('/vapor', baseURL).href)
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('vapor-probe')).toHaveAttribute('data-runtime', 'pending')
    await expect(page.getByTestId('vapor-count')).toHaveText('Count: 0; doubled: 0')
    await expect(page.getByTestId('interop-slot')).toHaveText('VDOM slot count: 0')
    await expect(page.getByTestId('vdom-badge')).toHaveText('0')
  } finally {
    await context.close()
  }
})

test('hydrates and preserves models, slots and interop across remount', async ({ page }) => {
  await page.goto('/vapor')
  await expect(page.getByTestId('vapor-probe')).toHaveAttribute('data-runtime', 'vapor')
  await page.getByTestId('increment').click()
  await expect(page.getByTestId('parent-count')).toHaveText('Parent count: 1')
  await expect(page.getByTestId('vapor-count')).toHaveText('Count: 1; doubled: 2')
  await expect(page.getByTestId('interop-slot')).toHaveText('VDOM slot count: 1')
  await expect(page.getByTestId('vdom-badge')).toHaveText('1')
  await page.getByTestId('vapor-input').fill('Vapor works')
  await expect(page.getByTestId('vapor-text')).toHaveText('Vapor works')
  await page.getByTestId('toggle-probe').click()
  await expect(page.getByTestId('vapor-probe')).toHaveCount(0)
  await page.getByTestId('toggle-probe').click()
  await expect(page.getByTestId('vapor-probe')).toHaveAttribute('data-runtime', 'vapor')
  await expect(page.getByTestId('vapor-text')).toHaveText('Vapor')
  await expect(page.getByTestId('vapor-count')).toHaveText('Count: 1; doubled: 2')
  await page.getByTestId('increment').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('vdom-badge')).toHaveText('2')
})

test('probe has no automated WCAG A/AA violations', async ({ page }) => {
  await page.goto('/vapor')
  await expect(page.getByTestId('vapor-probe')).toHaveAttribute('data-runtime', 'vapor')
  const results = await new AxeBuilder({ page })
    .include('main.vapor-test')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
