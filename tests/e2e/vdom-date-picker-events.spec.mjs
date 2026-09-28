import { expect, test } from '@playwright/test'

test('VDOM owner feeding DatePicker events from its period does not loop', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch|recursive updates/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vdom-date-picker-events')
  await expect(page.getByTestId('date-picker-events')).toHaveAttribute('data-ready', 'true')
  const updates = page.getByTestId('period-updates')
  const eventDays = page.getByTestId('date-picker').locator('.dp-day:has(.period-event) .dayNo')

  await expect(page.getByTestId('period-month')).toHaveText('2026-06')
  await expect(eventDays).toHaveText(['3', '16'])
  // Re-rendering the owner with new events must not emit the unchanged period again
  const settled = await updates.textContent()
  await page.waitForTimeout(500)
  await expect(updates).toHaveText(settled)
  expect(Number(settled)).toBeLessThanOrEqual(2)

  await page.getByTestId('date-picker').locator('[data-picker-next-month]').click()
  await expect(page.getByTestId('period-month')).toHaveText('2026-07')
  await expect(updates).toHaveText(String(Number(settled) + 1))
  await expect(eventDays).toHaveText(['3', '16'])
  await page.waitForTimeout(300)
  await expect(updates).toHaveText(String(Number(settled) + 1))
  expect(errors).toEqual([])
})

test('DatePicker events and localized navigation render on the server', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vdom-date-picker-events')
    await expect(page.getByTestId('period-month')).toHaveText('2026-06')
    await expect(page.getByTestId('date-picker').locator('.dp-day:has(.period-event) .dayNo')).toHaveText(['3', '16'])
    await expect(page.getByRole('link', { name: 'DatePicker · události z VDOM rodiče', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vdom-date-picker-events')
  } finally {
    await context.close()
  }
})
