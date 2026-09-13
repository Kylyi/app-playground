import { expect, test } from '@playwright/test'

test('input menus keep their wrapper anchors after remount', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-input-anchors')
  await expect(page.getByTestId('input-anchors')).toHaveAttribute('data-ready', 'true')
  for (const remount of [false, true]) {
    if (remount) {
      await page.getByRole('button', { name: 'Toggle inputs' }).click()
      await expect(page.locator('.menu')).toHaveCount(0)
      await page.getByRole('button', { name: 'Toggle inputs' }).click()
    }
    for (const name of ['text', 'color', 'icon', 'month']) {
      const section = page.getByTestId(`${name}-anchor`)
      await section.locator('.control').first().click()
      const menu = page.locator('.menu').last()
      await expect(menu).toBeVisible()
      await expect.poll(async () => {
        const anchor = await section.locator(name === 'text' ? '.wrapper' : '.input-wrapper-border').boundingBox()
        const popup = await menu.boundingBox()

        return Math.abs(name === 'text' ? popup.x - anchor.x - anchor.width : popup.x - anchor.x)
      }).toBeLessThan(20)
      // Unmount with the popup open, then verify fresh refs when inputs return.
      if (name !== 'month') {
        await page.getByTestId('input-anchors').click({ position: { x: 500, y: 10 } })
        await expect(page.locator('.menu')).toHaveCount(0)
      }
    }
  }
  expect(errors).toEqual([])
})

test('input anchor fixture renders on the server without open menus', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-input-anchors')
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('color-anchor').locator('input')).toHaveValue('#ff0000')
    await expect(page.getByTestId('month-anchor')).toContainText('Month')
    await expect(page.locator('.menu')).toHaveCount(0)
  } finally {
    await context.close()
  }
})
