import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'
import { captureState } from '../visual/capture-state.mjs'

assertRendererDiagnostics(test)

test.use({ timezoneId: 'Europe/Prague' })

for (const locale of ['cs-CZ', 'en-US']) {
  test(`full datetime mask, calendar constraints, time and exposed methods (${locale})`, async ({ page }, testInfo) => {
    await page.goto(`/${locale}/vapor-datetime-full?utc=true`)
    const target = page.getByTestId('datetime-full-example')
    await expect(target).toHaveAttribute('data-ready', 'true')
    const field = page.getByTestId('datetime-full-field')
    const input = field.locator('input')
    await expect(input).toHaveValue(locale === 'cs-CZ' ? '15.06.2026 14:30' : '06/15/2026 02:30 PM')
    await input.fill(locale === 'cs-CZ' ? '21.06.2026 08:45' : '06/21/2026 08:45 AM')
    await expect(page.getByTestId('datetime-full-value')).toHaveText('2026-06-21T08:45Z')
    const picker = page.locator('.datetime-full-picker')
    await expect(picker).toBeVisible()
    const day = number => picker.locator('.dp-day').filter({ has: page.locator('.dayNo').getByText(String(number), { exact: true }) })
    for (const number of [17, 18]) {
      await expect(day(number)).toHaveClass(/(?:^|\s)is-disabled(?:\s|$)/)
      await day(number).dispatchEvent('click')
      await expect(page.getByTestId('datetime-full-value')).toHaveText('2026-06-21T08:45Z')
    }
    await day(16).click()
    await expect(page.getByTestId('datetime-full-value')).toHaveText('2026-06-16T08:45Z')
    await expect(picker).toBeVisible()
    await expect(input).toBeFocused()
    await expect.poll(() => input.evaluate(element => element.selectionStart)).toBe(11)
    await captureState({ page, testInfo, target: page.locator('.menu'), state: `datetime-desktop-${locale}`, families: ['Inputs', 'DatePicker', 'ScrollPicker', 'Menu'] })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Select datetime', exact: true }).click()
    expect(await input.evaluate(element => [element.selectionStart, element.selectionEnd]))
      .toEqual([0, locale === 'cs-CZ' ? 16 : 19])
    await page.getByRole('button', { name: 'Blur datetime', exact: true }).click()
    await expect(input).not.toBeFocused()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    await expect(field.locator('label')).toHaveText('Custom datetime')
    await page.getByRole('button', { name: 'Clear datetime slot', exact: true }).click()
    await expect(page.getByTestId('datetime-full-value')).toHaveText('empty')
    await expect.poll(async () => JSON.parse(await page.getByTestId('datetime-full-events').textContent()).clear).toBe(1)
    await page.getByRole('button', { name: 'Reset datetime', exact: true }).click()
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
    await expect(field).toHaveCount(0)
    await expect(page.locator('.menu')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
    await expect(input).toHaveValue(locale === 'cs-CZ' ? '15.06.2026 14:30' : '06/15/2026 02:30 PM')
    await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
    await expect(input).toHaveAttribute('readonly', '')
    await expect(field.locator('.picker-icon')).toHaveCount(0)
    await input.click()
    await expect(page.locator('.menu')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
    await page.getByRole('button', { name: 'Toggle disabled', exact: true }).click()
    await expect(input).toBeDisabled()
  })
}

test('local display preserves the UTC instant and auto-close closes after selecting a date', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-datetime-full?autoClose=true')
  await expect(page.getByTestId('datetime-full-example')).toHaveAttribute('data-ready', 'true')
  const input = page.getByTestId('datetime-full-field').locator('input')
  await expect(input).toHaveValue('15.06.2026 16:30')
  await input.click()
  await page.locator('.datetime-full-picker .dp-day').filter({ has: page.locator('.dayNo').getByText('16', { exact: true }) }).click()
  await expect(page.getByTestId('datetime-full-value')).toHaveText('2026-06-16T14:30Z')
  await expect(page.locator('.menu')).toHaveCount(0)
})

test.describe('compact datetime picker', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('date selection switches cached panes, touch time editing and apply preserve the value', async ({ page }, testInfo) => {
    await page.goto('/cs-CZ/vapor-datetime-full?utc=true')
    await expect(page.getByTestId('datetime-full-example')).toHaveAttribute('data-ready', 'true')
    await page.getByTestId('datetime-full-field').locator('input').tap()
    const dialog = page.locator('.dialog__wrapper')
    await expect(dialog).toBeVisible()
    await dialog.locator('.dp-day').filter({ has: page.locator('.dayNo').getByText('16', { exact: true }) }).tap()
    await expect(dialog.locator('.time-picker')).toBeVisible()
    await expect(dialog.locator('.date-picker-calendar')).not.toBeVisible()
    const inputs = dialog.locator('.time-picker input')
    await inputs.first().fill('10')
    await inputs.last().fill('45')
    await expect(page.getByTestId('datetime-full-value')).toHaveText('2026-06-16T10:45Z')
    await captureState({ page, testInfo, target: dialog, state: 'datetime-compact-time', families: ['Inputs', 'Tabs', 'DatePicker', 'ScrollPicker', 'Dialog'] })
    await dialog.getByRole('tab', { name: 'Datum', exact: true }).tap()
    await expect(dialog.locator('.date-picker-calendar')).toBeVisible()
    await expect(dialog.locator('.dp-day.is-selected .dayNo')).toHaveText('16')
    await dialog.getByRole('tab', { name: 'Čas', exact: true }).tap()
    await expect(inputs.first()).toHaveValue('10')
    await expect(inputs.last()).toHaveValue('45')
    await dialog.getByRole('button', { name: 'Aplikovat', exact: true }).tap()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByTestId('datetime-full-field').locator('input')).toHaveValue('16.06.2026 10:45')
    await page.getByTestId('datetime-full-field').locator('input').tap()
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).evaluate(element => element.click())
    await expect(dialog).toHaveCount(0)
  })
})

test('full datetime renders localized masks with SSR and exposes all localized navigation variants', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false, timezoneId: 'Europe/Prague' })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-datetime-full?utc=true')
    await expect(page.getByTestId('datetime-full-field').locator('input')).toHaveValue('15.06.2026 14:30')
    await expect(page.getByTestId('datetime-full-value')).toHaveText('2026-06-15T14:30Z')
    await expect(page.locator('.menu')).toHaveCount(0)
    for (const [name, href] of [
      ['DateTimeFullInput · datum a čas', '/cs-CZ/vapor-datetime-full'],
      ['DateTimeFullInput · UTC', '/cs-CZ/vapor-datetime-full?utc=true'],
      ['DateTimeFullInput · automatické zavření', '/cs-CZ/vapor-datetime-full?utc=true&autoClose=true'],
    ]) {
      await expect(page.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
  } finally {
    await context.close()
  }
})
