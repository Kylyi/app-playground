import { expect, test } from '@playwright/test'
import '../e2e/vapor-value-contracts.spec.mjs'
import { captureState } from './capture-state.mjs'

test.beforeEach(async ({ context, baseURL }, testInfo) => {
  await context.addCookies([{ name: 'theme', value: testInfo.project.metadata.theme, url: baseURL }])
})

test.afterEach(async ({ page }, testInfo) => {
  if (page.url() !== 'about:blank') {
    await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${testInfo.project.metadata.theme}\\b`))
  }
})

test('datetime picker preserves day and time in its desktop or compact layout', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-datetime-full?utc=true')
  await expect(page.getByTestId('datetime-full-example')).toHaveAttribute('data-ready', 'true')
  const compact = page.viewportSize().width < 640
  const input = page.getByTestId('datetime-full-field').locator('input')
  await expect(input).toHaveValue('15.06.2026 14:30')
  if (compact) {
    await input.tap()
  } else {
    await input.click()
  }
  const picker = page.locator(compact ? '.dialog__wrapper' : '.menu')
  await expect(picker).toBeVisible()
  const families = ['Inputs', 'DatePicker', 'ScrollPicker', 'Tabs', 'Menu', 'Dialog']
  await captureState({ page, testInfo, target: picker, state: 'datetime-calendar-open', families })
  const day = picker.locator('.dp-day').filter({ has: page.locator('.dayNo').getByText('16', { exact: true }) })
  if (compact) {
    await day.tap()
    const timeInputs = picker.locator('.time-picker input')
    await timeInputs.first().fill('10')
    await timeInputs.last().fill('45')
    await picker.getByRole('tab', { name: 'Datum', exact: true }).tap()
    await picker.getByRole('tab', { name: 'Čas', exact: true }).tap()
    await expect(timeInputs.first()).toHaveValue('10')
    await expect(timeInputs.last()).toHaveValue('45')
  } else {
    await day.click()
    const wheels = picker.locator('.scroll-picker')
    await wheels.first().locator('.scroll-picker__item').getByText('10', { exact: true }).click()
    await wheels.last().locator('.scroll-picker__item').getByText('45', { exact: true }).click()
  }
  await expect(page.getByTestId('datetime-full-value')).toHaveText('2026-06-16T10:45Z')
  await captureState({ page, testInfo, target: picker, state: 'datetime-time-selected', families })
  if (compact) {
    await picker.getByRole('button', { name: 'Aplikovat', exact: true }).tap()
  } else {
    await page.keyboard.press('Escape')
  }
  await expect(picker).toHaveCount(0)
  await expect(input).toHaveValue('16.06.2026 10:45')
})
