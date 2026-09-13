import { expect, test } from '@playwright/test'

for (const locale of ['cs-CZ', 'en-US']) {
  test(`date and time masks, pickers and slots survive remount (${locale})`, async ({ page }) => {
    const problems = []
    page.on('pageerror', error => problems.push(error.message))
    page.on('console', message => {
      if (/hydration|no active component/i.test(message.text())) {
        problems.push(message.text())
      }
    })
    await page.goto(`/${locale}/vapor-date-time-inputs`)
    await expect(page.getByTestId('date-time-example')).toHaveAttribute('data-ready', 'true')
    const date = page.getByTestId('date-field').locator('input')
    const time = page.getByTestId('time-field').locator('input')
    await expect(date).toHaveValue(locale === 'cs-CZ' ? '15.06.2026' : '06/15/2026')
    await expect(time).toHaveValue(locale === 'cs-CZ' ? '14:30' : '02:30')
    await date.fill(locale === 'cs-CZ' ? '21.06.2026' : '06/21/2026')
    await page.getByRole('button', { name: 'Select date', exact: true }).click()
    expect(await date.evaluate(el => [el.selectionStart, el.selectionEnd])).toEqual([0, 10])
    await expect(page.getByTestId('date-value')).toHaveText('2026-06-21')
    await date.click()
    await page.locator('.menu .dp-day').filter({ has: page.locator('.dayNo').getByText('16', { exact: true }) }).click()
    await expect(page.getByTestId('date-value')).toHaveText('2026-06-16')
    await expect(page.locator('.menu')).toHaveCount(0)
    await time.click()
    await page.locator('.menu').getByText('Morning', { exact: true }).click()
    await expect(page.getByTestId('time-value')).toHaveText('09:15')
    await page.locator('.menu').getByText('Evening', { exact: true }).click()
    await expect(page.getByTestId('time-value')).toHaveText('18:45')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    await expect(page.getByTestId('date-field').locator('label')).toHaveText('Custom Date')
    await expect(page.getByTestId('time-field').locator('label')).toHaveText('Custom Time')
    await time.click()
    await expect(page.getByTestId('custom-shortcuts')).toBeVisible()
    await expect(page.locator('.menu').getByText('Morning', { exact: true })).toHaveCount(0)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Clear date', exact: true }).click()
    await expect(page.getByTestId('date-value')).toHaveText('empty')
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    await page.getByRole('button', { name: 'Replace time', exact: true }).click()
    await expect(time).toHaveValue(locale === 'cs-CZ' ? '23:10' : '11:10')
    await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
    await expect(time).toHaveAttribute('readonly', '')
    await expect(page.getByTestId('time-field').locator('button')).toHaveCount(0)
    await time.click()
    await expect(page.locator('.menu')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
    await expect(time).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
    await page.getByRole('button', { name: 'Select time', exact: true }).click()
    expect(await time.evaluate(el => [el.selectionStart, el.selectionEnd])).toEqual([0, 5])
    await page.getByRole('button', { name: 'Blur time', exact: true }).click()
    await expect(time).not.toBeFocused()
    expect(problems).toEqual([])
  })
}

test('date and time render localized values and navigation in SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-date-time-inputs')
    await expect(page.getByTestId('date-field').locator('input')).toHaveValue('15.06.2026')
    await expect(page.getByTestId('time-field').locator('input')).toHaveValue('14:30')
    await expect(page.getByTestId('year-month-field')).toContainText('Červen 2026')
    await expect(page.locator('.menu')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Datum a čas · masky a pickery', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-date-time-inputs')
  } finally {
    await context.close()
  }
})

test('time picker edits hours and minutes in the mobile dialog', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  try {
    const page = await context.newPage()
    const problems = []
    page.on('pageerror', error => problems.push(error.message))
    await page.goto('/cs-CZ/vapor-date-time-inputs')
    await expect(page.getByTestId('date-time-example')).toHaveAttribute('data-ready', 'true')
    await page.getByTestId('time-field').locator('input').tap()
    const dialog = page.locator('.dialog__wrapper')
    await expect(dialog).toBeVisible()
    await dialog.locator('input').first().fill('10')
    await dialog.locator('input').last().fill('45')
    await expect(page.getByTestId('time-value')).toHaveText('10:45')
    await dialog.getByText('Morning', { exact: true }).tap()
    await expect(page.getByTestId('time-value')).toHaveText('09:15')
    expect(problems).toEqual([])
  } finally {
    await context.close()
  }
})

test('date picker switches month and year grids before selecting a day', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  await page.goto('/cs-CZ/vapor-date-time-inputs')
  await expect(page.getByTestId('date-time-example')).toHaveAttribute('data-ready', 'true')

  const date = page.getByTestId('date-field').locator('input')
  await date.click()
  const menu = page.locator('.menu')

  await menu.locator('[data-picker-months]').click()
  const months = menu.locator('[data-picker-month-grid]')
  await expect(months).toBeVisible()
  await months.locator('[data-picker-month="0"]').click()
  await expect(menu.locator('.date-picker-calendar')).toBeVisible()
  await expect(menu.locator('.date-picker-days')).toHaveCount(1)

  await menu.locator('[data-picker-years]').click()
  const years = menu.locator('[data-picker-year-grid]')
  await expect(years).toBeVisible()
  await years.locator('[data-picker-year="2028"]').click()
  await expect(months).toBeVisible()
  await months.locator('[data-picker-month="0"]').click()
  await expect(menu.locator('.date-picker-calendar')).toBeVisible()
  await expect(menu.locator('.date-picker-days')).toHaveCount(1)

  await menu.locator('.dp-day').filter({ has: page.locator('.dayNo').getByText('16', { exact: true }) }).click()
  await expect(page.getByTestId('date-value')).toHaveText('2028-01-16')
  expect(problems).toEqual([])
})

test('year and month selector updates through its VDOM month grid', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  await page.goto('/cs-CZ/vapor-date-time-inputs')
  await expect(page.getByTestId('date-time-example')).toHaveAttribute('data-ready', 'true')

  const field = page.getByTestId('year-month-field')
  await expect(field).toContainText('Červen 2026')
  await field.locator('.input-wrapper__input').click()
  const grid = page.locator('.menu .month-selector-grid')
  await expect(grid).toBeVisible()
  await grid.getByRole('button').first().click()
  await expect(page.getByTestId('year-month-value')).toHaveText('2026-01')
  await expect(page.locator('.menu')).toHaveCount(0)
  expect(problems).toEqual([])
})
