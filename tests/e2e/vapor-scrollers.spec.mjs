import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

test('scroller arrows advance once on keyboard activation and stop on release', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-scrollers')
  await expect(page.getByTestId('scrollers-example')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Set positions', exact: true }).click()
  for (const axis of ['horizontal', 'vertical']) {
    const scroller = page.getByTestId(axis)
    const next = scroller.getByRole('button', { name: 'Následující', exact: true })
    await next.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('220')
    await page.keyboard.press('Space')
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('300')
    const previous = scroller.getByRole('button', { name: 'Předchozí', exact: true })
    await previous.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('220')
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('220')
  }
})

test('scrollers remeasure changed content without a scroll or viewport resize', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-scrollers')
  await expect(page.getByTestId('scrollers-example')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Scroll to start', exact: true }).click()
  for (const axis of ['horizontal', 'vertical']) {
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('0')
    await expect(page.getByTestId(axis)).toHaveClass(/(?:^|\s)is-overflown(?:\s|$)/)
  }
  await page.getByRole('button', { name: 'Toggle content size', exact: true }).click()
  for (const axis of ['horizontal', 'vertical']) {
    await expect(page.getByTestId(axis)).not.toHaveClass(/(?:^|\s)is-overflown(?:\s|$)/)
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('0')
  }
  await page.getByRole('button', { name: 'Toggle content size', exact: true }).click()
  for (const axis of ['horizontal', 'vertical']) {
    await expect(page.getByTestId(axis)).toHaveClass(/(?:^|\s)is-overflown(?:\s|$)/)
  }
})

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
    await expect(page.getByTestId(axis)).toHaveClass(/(?:^|\s)is-overflown(?:\s|$)/)
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
    // Horizontal translates the actual wheel distance; vertical keeps native scrolling.
    await surface.hover()
    await page.mouse.wheel(0, 50)
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('215')
    await page.mouse.wheel(0, 50)
    await expect(page.getByTestId(`${axis}-position`)).toHaveText('265')
    expect(Number(await page.getByTestId(`${axis}-events`).textContent())).toBeGreaterThan(events)
  }
  for (const axis of ['horizontal', 'vertical']) {
    const arrow = page.getByTestId(axis).locator(`[name="scroll-${axis === 'horizontal' ? 'right' : 'bottom'}"]`)
    const position = page.getByTestId(`${axis}-position`)
    const beforeHold = Number(await position.textContent())
    await arrow.dispatchEvent('pointerdown', { pointerId: 1, button: 0 })
    await expect.poll(async () => Number(await position.textContent())).toBeGreaterThan(beforeHold + 15)
    const stopped = await page.getByTestId(axis).locator('.content').evaluate((el, axis) => {
      window.dispatchEvent(new PointerEvent('pointercancel'))

      return axis === 'horizontal' ? el.scrollLeft : el.scrollTop
    }, axis)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await expect(position).toHaveText(String(stopped))
  }
  await page.getByRole('button', { name: 'Toggle overflow', exact: true }).click()
  for (const axis of ['horizontal', 'vertical']) {
    await expect(page.getByTestId(axis)).not.toHaveClass(/(?:^|\s)is-overflown(?:\s|$)/)
  }
  await page.getByRole('button', { name: 'Toggle overflow', exact: true }).click()
  await expect(page.getByTestId('horizontal')).toHaveClass(/(?:^|\s)is-overflown(?:\s|$)/)
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
  await expect(page.getByTestId('horizontal-position')).toHaveText('190')
  expect(errors).toEqual([])
})

test('scroller content and localized navigation render without JavaScript', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
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
