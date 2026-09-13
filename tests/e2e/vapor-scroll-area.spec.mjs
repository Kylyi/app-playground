import { expect, test } from '@playwright/test'

test('ScrollArea initializes after its DOM ancestor transition and follows slot changes', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-scroll-area')
  await expect(page.getByTestId('scroll-area-fixture')).toHaveAttribute('data-ready', 'true')
  const area = page.locator('.scroll-area')
  await expect(area.locator('.ps__rail-y')).toHaveCount(1)
  await expect(area).not.toHaveClass(/ps--active-y/)
  await page.getByRole('button', { name: 'Resize content' }).click()
  await expect(area).toHaveClass(/ps--active-y/)
  await page.getByRole('button', { name: 'Scroll to bottom' }).click()
  await expect.poll(() => area.evaluate(el => el.scrollTop)).toBeGreaterThan(200)
  await page.getByRole('button', { name: 'Resize content' }).click()
  await expect(area).not.toHaveClass(/ps--active-y/)
  await page.getByRole('button', { name: 'Toggle child' }).click()
  await expect(area).toHaveClass(/ps--active-y/)
  await page.getByRole('button', { name: 'Toggle child' }).click()
  await expect(area).not.toHaveClass(/ps--active-y/)

  await page.getByRole('button', { name: 'Toggle area' }).click()
  await page.getByRole('button', { name: 'Toggle area' }).click()
  await expect(area.locator('.ps__rail-y')).toHaveCount(0)
  // Dispose while initialization is still delayed.
  await page.getByRole('button', { name: 'Toggle area' }).click()
  await page.waitForTimeout(400)
  await expect(page.locator('.ps__rail-y')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle immediate' }).click()
  await page.getByRole('button', { name: 'Toggle area' }).click()
  await expect(area.locator('.ps__rail-y')).toHaveCount(1)
  await page.getByRole('button', { name: 'Scroll to bottom' }).dispatchEvent('click')
  await page.getByRole('button', { name: 'Toggle area' }).click()
  await expect(area).toHaveCount(0)
  expect(errors).toEqual([])
})

test('ScrollArea leaves server content intact without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-scroll-area')
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('scroll-child')).toBeVisible()
    await expect(page.locator('.ps__rail-y')).toHaveCount(0)
  } finally {
    await context.close()
  }
})
