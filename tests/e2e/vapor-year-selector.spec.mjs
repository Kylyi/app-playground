import { expect, test } from '@playwright/test'

for (const mobile of [false, true]) {
  test(`native YearSelector keeps draft navigation separate from selection (mobile=${mobile})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (/hydration.*mismatch/i.test(message.text())) {
        errors.push(message.text())
      }
    })
    if (mobile) {
      await page.setViewportSize({ width: 390, height: 844 })
    }
    await page.goto('/cs-CZ/vapor-year-selector')
    await expect(page.getByTestId('year-example')).toHaveAttribute('data-ready', 'true')
    const input = page.getByTestId('year-selector').locator('input')
    const menu = page.locator('.year-options')
    const years = menu.locator('[name="year"]')
    await expect(input).toHaveValue('2024')
    if (!mobile) {
      await page.locator('.next-year').click()
      await expect(page.getByTestId('selected-date')).toHaveText('2025-06-15')
      await page.locator('.previous-year').click()
      await expect(page.getByTestId('selected-date')).toHaveText('2024-06-15')
    }
    await input.fill('2028')
    await expect(page.getByTestId('selected-date')).toHaveText('2028-06-15')
    await page.getByRole('button', { name: 'Set external year', exact: true }).click()
    await expect(input).toHaveValue('2030')
    await input.click()
    await expect(years).toHaveText(['2028', '2029', '2030', '2031', '2032'])
    await menu.dispatchEvent('wheel', { deltaY: 50 })
    await expect(years).toHaveText(['2029', '2030', '2031', '2032', '2033'])
    await expect(page.getByTestId('selected-date')).toHaveText('2030-06-15')
    await years.filter({ hasText: /^2032$/ }).click()
    await expect(page.getByTestId('selected-date')).toHaveText('2032-06-15')
    await expect(menu).toHaveCount(0)
    await input.click()
    await expect(years).toHaveText(['2030', '2031', '2032', '2033', '2034'])
    await menu.dispatchEvent('wheel', { deltaY: -50 })
    await expect(years).toHaveText(['2029', '2030', '2031', '2032', '2033'])
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(input).toHaveValue('2032')
    await input.click()
    await menu.locator('[name="decrement"]').dispatchEvent('pointerdown', { pointerId: 1 })
    await expect.poll(() => input.inputValue()).not.toBe('2032')
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel')))
    const stopped = await input.inputValue()
    // Longer than the 120ms repeat period, to catch a surviving repeat timer.
    await page.waitForTimeout(260)
    await expect(input).toHaveValue(stopped)
    await menu.locator('[name="decrement"]').dispatchEvent('pointerdown', { pointerId: 1 })
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await page.waitForTimeout(260)
    await expect(input).toHaveValue('2032')
    await input.click()
    const detached = await menu.elementHandle()
    await menu.locator('[name="decrement"]').dispatchEvent('pointerdown', { pointerId: 1 })
    await page.getByRole('button', { name: 'Toggle year owner', exact: true }).evaluate(el => el.click())
    await expect(menu).toHaveCount(0)
    expect(await detached.evaluate(el => {
      const event = new WheelEvent('wheel', { deltaY: 50, cancelable: true })
      el.dispatchEvent(event)

      return event.defaultPrevented
    })).toBe(false)
    await detached.dispose()
    await page.getByRole('button', { name: 'Toggle year owner', exact: true }).click()
    await expect(input).toHaveValue('2032')
    await input.click()
    await menu.dispatchEvent('wheel', { deltaY: 50 })
    await expect(years).toHaveText(['2031', '2032', '2033', '2034', '2035'])
    expect(errors).toEqual([])
  })
}

test('year selector and localized navigation render on the server', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-year-selector')
    await expect(page.getByTestId('year-selector').locator('input')).toHaveValue('2024')
    await expect(page.locator('.year-options')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'YearSelector · rok a lifecycle', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-year-selector')
  } finally {
    await context.close()
  }
})
