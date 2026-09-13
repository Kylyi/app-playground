import { expect, test } from '@playwright/test'

test('cell editors focus and select again across VDOM and Vapor mounts', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/cs-CZ/vapor-table-focus')
  await expect(page.getByTestId('table-focus')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.table-loading')).toHaveCount(0)
  for (const [id, field, text] of [[1, 'name', 'Alpha'], [1, 'custom', 'Bravo'], [2, 'name', 'Charlie'], [1, 'custom', 'Bravo']]) {
    const cell = page.locator(`.td[data-key="${id}"][data-field="${field}"]`)
    await cell.click()
    const input = cell.locator('input')
    await expect(input).toBeFocused()
    await expect(input).toHaveValue(text)
    await expect.poll(() => input.evaluate(el => [el.selectionStart, el.selectionEnd])).toEqual([0, text.length])
    await page.keyboard.press('Escape')
    await expect(input).toHaveCount(0)
  }
  expect(errors).toEqual([])
})

for (const [name, selector] of [['Table', '.filtering'], ['Pivot', '.pivot-filter-menu']]) {
  test(`${name} focuses newly added filters without ref-array ordering`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/cs-CZ/vapor-table-focus')
    await expect(page.getByTestId('table-focus')).toHaveAttribute('data-ready', 'true')
    await expect(page.locator('.table-loading')).toHaveCount(0)
    const menu = page.locator(selector)
    const trigger = page.locator(name === 'Table' ? '.filter-btn' : '.pivot .pivot-filter-btn').first()
    const values = menu.locator('.qb-item__content-value input')
    await trigger.click()
    await expect(values).toHaveCount(1)
    await expect(values.first()).toBeFocused()
    await values.first().fill('Alpha')
    await page.keyboard.press('Escape')
    await trigger.click()
    await expect(values.first()).toBeFocused()
    await menu.getByRole('button', { name: /Přidat/i }).click()
    await expect(values).toHaveCount(2)
    await expect(values.last()).toBeFocused()
    await values.last().fill('Bravo')
    await expect(values.last()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('focus example renders SSR without creating editors or filters', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-table-focus')
    await expect(page.locator('.td[data-key="1"][data-field="name"]')).toHaveText('Alpha')
    await expect(page.locator('.active-edit-cell, .filtering, .pivot-filter-menu')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Table a Pivot · focus editorů', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-table-focus')
  } finally {
    await context.close()
  }
})
