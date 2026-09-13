import { expect, test } from '@playwright/test'

test('CornerResize preserves stepping, inversion and limits and cancels on unmount', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-corner-resize')
  await expect(page.getByTestId('corner-resize')).toHaveAttribute('data-ready', 'true')
  const values = () => page.getByTestId('corner-values').evaluate(el => JSON.parse(el.textContent))
  for (const [corner, dx, dy, expected] of [['n', 0, -13, 35], ['e', 13, 0, 5], ['w', -100, 0, 60]]) {
    await page.locator(`[data-adjust-corner="${corner}"]`).evaluate((el, { dx, dy }) => {
      const rect = el.getBoundingClientRect()
      const point = { clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 }
      el.dispatchEvent(new PointerEvent('pointerdown', { ...point, pointerId: 1, bubbles: true }))
      const end = { clientX: point.clientX + dx, clientY: point.clientY + dy, pointerId: 1 }
      window.dispatchEvent(new PointerEvent('pointermove', end))
      // Release in the same task, before the sampled frame.
      window.dispatchEvent(new PointerEvent('pointerup', end))
    }, { dx, dy })
    await expect.poll(async () => (await values())[corner]).toBe(expected)
  }
  await expect(page.locator('[data-adjust-corner]')).toHaveCount(3)
  const box = await page.locator('[data-adjust-corner="n"]').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y - 8, { steps: 3 })
  await expect(page.locator('body')).toHaveCSS('user-select', 'none')
  await page.getByRole('button', { name: 'Toggle corners' }).evaluate(el => el.click())
  await expect(page.locator('[data-adjust-corner]')).toHaveCount(0)
  const cancelled = await values()
  await page.mouse.move(100, 100)
  await page.mouse.up()
  expect(await values()).toEqual(cancelled)
  expect(await page.locator('body').evaluate(el => el.style.userSelect)).toBe('')
  await page.getByRole('button', { name: 'Toggle corners' }).click()
  await expect(page.locator('[data-adjust-corner]')).toHaveCount(3)
  expect(errors).toEqual([])
})

test('CornerResize renders configured handles on the server', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-corner-resize')
    await expect(page.locator('[data-adjust-corner]')).toHaveCount(3)
    await expect(page.getByRole('link', { name: 'CornerResize · hodnoty hran', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-corner-resize')
  } finally {
    await context.close()
  }
})
