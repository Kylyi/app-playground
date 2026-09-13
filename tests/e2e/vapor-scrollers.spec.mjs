import { expect, test } from '@playwright/test'

test('native scrollers synchronize both axes, wheel, resize and held-arrow cleanup', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-scrollers')
  await expect(page.getByTestId('scrollers-example')).toHaveAttribute('data-ready', 'true')
  for (const axis of ['horizontal', 'vertical']) {
    const surface = page.getByTestId(axis).locator('.content')
    await expect.poll(() => surface.evaluate((el, axis) => axis === 'horizontal' ? el.scrollLeft : el.scrollTop, axis)).toBe(60)
    await expect(page.getByTestId(axis)).toHaveClass(/is-overflown/)
  }
  await page.getByRole('button', { name: 'Set positions', exact: true }).click()
  for (const axis of ['horizontal', 'vertical']) {
    await expect.poll(() => page.getByTestId(axis).locator('.content').evaluate((el, axis) => axis === 'horizontal' ? el.scrollLeft : el.scrollTop, axis)).toBe(140)
  }
  await page.getByRole('button', { name: 'Scroll relatively', exact: true }).click()
  for (const axis of ['horizontal', 'vertical']) {
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('165')
    const events = Number(await page.getByTestId(`${axis}-events`).textContent())
    const surface = page.getByTestId(axis).locator('.content')
    await surface.dispatchEvent('wheel', { deltaY: 50 })
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('190')
    await surface.dispatchEvent('wheel', { deltaY: 50 })
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('215')
    expect(Number(await page.getByTestId(`${axis}-events`).textContent())).toBeGreaterThan(events)
  }
  for (const axis of ['horizontal', 'vertical']) {
    const arrow = page.getByTestId(axis).locator(`[name="scroll-${axis === 'horizontal' ? 'right' : 'bottom'}"]`)
    const position = page.getByTestId(`${axis}-position`)
    await arrow.dispatchEvent('pointerdown', { pointerId: 1, button: 0 })
    await expect.poll(async () => Number(await position.textContent())).toBeGreaterThan(230)
    const stopped = await page.getByTestId(axis).locator('.content').evaluate((el, axis) => {
      window.dispatchEvent(new PointerEvent('pointercancel'))

      return axis === 'horizontal' ? el.scrollLeft : el.scrollTop
    }, axis)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await expect(position).toHaveText(String(stopped))
  }
  await page.getByRole('button', { name: 'Toggle overflow', exact: true }).click()
  for (const axis of ['horizontal', 'vertical']) {
    await expect(page.getByTestId(axis)).not.toHaveClass(/is-overflown/)
  }
  await page.getByRole('button', { name: 'Toggle overflow', exact: true }).click()
  await expect(page.getByTestId('horizontal')).toHaveClass(/is-overflown/)
  const surface = page.getByTestId('horizontal').locator('.content')
  const detached = await surface.elementHandle()
  await page.getByTestId('horizontal').locator('[name="scroll-right"]').dispatchEvent('pointerdown', { pointerId: 1 })
  await page.getByRole('button', { name: 'Toggle owners', exact: true }).evaluate(el => el.click())
  expect(await detached.evaluate(el => {
    const event = new WheelEvent('wheel', { deltaY: 50, cancelable: true })
    el.dispatchEvent(event)

    return event.defaultPrevented
  })).toBe(false)
  const events = await page.getByTestId('horizontal-events').textContent()
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect(page.getByTestId('horizontal-events')).toHaveText(events)
  await detached.dispose()
  await page.getByRole('button', { name: 'Toggle owners', exact: true }).click()
  await expect(page.getByTestId('horizontal')).toBeVisible()
  await page.getByRole('button', { name: 'Set positions', exact: true }).click()
  await page.getByTestId('horizontal').locator('.content').dispatchEvent('wheel', { deltaY: 50 })
  await expect(page.getByTestId('horizontal-position')).toHaveText('165')
  expect(errors).toEqual([])
})

test('scroller content and localized navigation render without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-scrollers')
    await expect(page.getByTestId('horizontal')).toContainText('Item 20')
    await expect(page.getByTestId('vertical')).toContainText('Row 20')
    await expect(page.getByRole('link', { name: 'Scrollery · osy a lifecycle', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-scrollers')
  } finally {
    await context.close()
  }
})
