import { expect, test } from '@playwright/test'

test('native Vapor movement and resize release gestures on owner removal', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-element-movement')
  await expect(page.getByTestId('element-movement')).toHaveAttribute('data-ready', 'true')
  const dimensions = () => page.getByTestId('dimensions').evaluate(el => JSON.parse(el.textContent))

  for (const selector of ['[data-testid="move-handle"]', '.resize-handles__bottom-right']) {
    const handle = page.locator(selector)
    const box = await handle.boundingBox()
    const before = await dimensions()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 40, { steps: 5 })
    await page.mouse.up()
    const field = selector.includes('move-handle') ? 'x' : 'w'
    await expect.poll(async () => (await dimensions())[field]).toBeGreaterThan(before[field] + 40)
    expect(await page.locator('body').evaluate(el => el.style.userSelect)).toBe('')

    const nextBox = await handle.boundingBox()
    await page.mouse.move(nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2)
    await page.mouse.down()
    await expect(page.locator('body')).toHaveCSS('user-select', 'none')
    await page.getByRole('button', { name: 'Toggle movement' }).evaluate(el => el.click())
    await expect(page.getByTestId('moving-box')).toHaveCount(0)
    const removed = await dimensions()
    expect(await page.locator('body').evaluate(el => el.style.userSelect)).toBe('')
    await page.mouse.move(100, 100)
    await page.mouse.up()
    expect(await dimensions()).toEqual(removed)
    await page.getByRole('button', { name: 'Toggle movement' }).click()
  }
  expect(errors).toEqual([])
})

test('movement surface renders on the server without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/vapor-element-movement')
    await expect(page.getByTestId('moving-box')).toBeVisible()
    await expect(page.locator('.resize-handles .handle')).toHaveCount(8)
  } finally {
    await context.close()
  }
})

test('release before RAF applies the latest move and resize coordinates', async ({ page }) => {
  await page.goto('/vapor-element-movement')
  await expect(page.getByTestId('element-movement')).toHaveAttribute('data-ready', 'true')
  for (const selector of ['[data-testid="move-handle"]', '.resize-handles__bottom-right']) {
    const before = JSON.parse(await page.getByTestId('dimensions').textContent())
    await page.locator(selector).evaluate(el => {
      const rect = el.getBoundingClientRect()
      const point = { clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 }
      el.dispatchEvent(new PointerEvent('pointerdown', { ...point, bubbles: true, button: 0, pointerId: 1 }))
      // All events happen in one task, before the browser can run a frame.
      window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: point.clientX + 20, clientY: point.clientY + 10 }))
      window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: point.clientX + 60, clientY: point.clientY + 40 }))
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: point.clientX + 60, clientY: point.clientY + 40 }))
    })
    const field = selector.includes('move-handle') ? 'x' : 'w'
    await expect.poll(async () => JSON.parse(await page.getByTestId('dimensions').textContent())[field])
      .toBeGreaterThan(before[field] + 40)
  }
})

test('movable Menu registers its header after opening and cancels on Escape', async ({ page }) => {
  await page.goto('/vapor-element-movement')
  await expect(page.getByTestId('element-movement')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Toggle movable menu' }).click()
  const header = page.locator('.menu-header').filter({ hasText: 'Movable menu' })
  const box = await header.boundingBox()
  const before = JSON.parse(await page.getByTestId('menu-dimensions').textContent())
  await page.mouse.move(box.x + 40, box.y + 15)
  await page.mouse.down()
  await page.mouse.move(box.x + 100, box.y + 55, { steps: 5 })
  await expect.poll(async () => JSON.parse(await page.getByTestId('menu-dimensions').textContent()).x)
    .toBeGreaterThan(before.x + 40)
  await page.keyboard.press('Escape')
  const cancelled = await page.getByTestId('menu-dimensions').textContent()
  await page.mouse.move(100, 100)
  await page.mouse.up()
  expect(await page.getByTestId('menu-dimensions').textContent()).toBe(cancelled)
  expect(await page.locator('body').evaluate(el => el.style.getPropertyValue('user-select'))).toBe('')
})
