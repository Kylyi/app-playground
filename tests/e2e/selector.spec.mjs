import { expect, test } from '@playwright/test'

const errorsByPage = new WeakMap()
test.beforeEach(async ({ page }) => {
  const errors = []
  errorsByPage.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || (message.type() === 'warning' && /hydration/i.test(message.text()))) {
      errors.push(message.text())
    }
  })
  await page.goto('/selector-vapor')
  await expect(page.getByTestId('selector-fixture')).toHaveAttribute('data-ready', 'true')
})
test.afterEach(async ({ page }) => {
  expect(errorsByPage.get(page)).toEqual([])
})

test('parent updates and exposed clear preserve the controlled model', async ({ page }) => {
  await expect(page.getByTestId('value')).toHaveText('undefined')
  await page.getByTestId('set-parent').click()
  await expect(page.getByTestId('selector')).toContainText('Beta')
  await expect(page.getByTestId('changes')).toHaveText('0')
  await page.getByTestId('set-null').click()
  await expect(page.getByTestId('value')).toHaveText('null')
  await expect(page.getByTestId('selector')).not.toContainText('Beta')
  await page.getByTestId('set-parent').click()
  await page.getByTestId('clear-exposed').click()
  await expect(page.getByTestId('changes')).toHaveText('1')
  await expect(page.getByTestId('selector')).not.toContainText('Beta')
  await page.getByTestId('set-undefined').click()
  await expect(page.getByTestId('value')).toHaveText('undefined')
})

test('selects an option and keeps omitted models local', async ({ page }) => {
  await page.getByTestId('selector').locator('.control').click()
  await page.locator('.selector-menu:visible').getByText('Alpha', { exact: true }).click()
  await expect(page.getByTestId('value')).toHaveText(JSON.stringify({ id: 1, label: 'Alpha' }))
  await expect(page.getByTestId('selector')).toContainText('Alpha')
  await expect(page.locator('.selector-menu:visible')).toHaveCount(0)
  await page.getByTestId('local-selector').locator('.control').click()
  await page.locator('.selector-menu:visible').getByText('Beta', { exact: true }).click()
  await expect(page.getByTestId('local-selector')).toContainText('Beta')
  await expect(page.getByTestId('value')).toHaveText(JSON.stringify({ id: 1, label: 'Alpha' }))
})

test('SSR includes the initial selection without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto(new URL('/selector-vapor', baseURL).href)
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('selector-fixture')).toHaveAttribute('data-ready', 'false')
    await expect(page.getByTestId('nested-selector')).toContainText('Beta')
    await expect(page.getByTestId('vapor-value')).toHaveText('2')
  } finally {
    await context.close()
  }
})

test('Vapor parent forwards custom options and preserves its model across remount', async ({ page }) => {
  const selector = page.getByTestId('nested-selector')
  await expect(selector).toContainText('Beta')
  await selector.locator('.control').click()
  await page.locator('.selector-menu:visible').getByText('Choice Alpha', { exact: true }).click()
  await expect(page.getByTestId('vapor-value')).toHaveText(/"code": 1/)
  await expect(selector).toContainText('Alpha')
  await expect(page.locator('.selector-menu:visible')).toHaveCount(0)
  await page.getByTestId('toggle-selector').click()
  await expect(selector).toHaveCount(0)
  await page.getByTestId('toggle-selector').click()
  await expect(selector).toContainText('Alpha')
})

test('search model and keyboard selection restore focus to the control', async ({ page }) => {
  const control = page.getByTestId('selector').locator('.control')
  await control.focus()
  const input = page.locator('.selector-menu:visible').getByRole('textbox')
  await input.fill('Gamma')
  await expect(page.getByTestId('search')).toHaveText('Gamma')
  await expect(page.locator('.selector-menu:visible')).toContainText('Gamma')
  await input.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('value')).toHaveText(JSON.stringify({ id: 3, label: 'Gamma' }))
  await expect(page.locator('.selector-menu:visible')).toHaveCount(0)
  await expect(control).toBeFocused()
})

test('short option menus show every row without clipping', async ({ page }) => {
  await page.getByTestId('nested-selector').locator('.control').click()
  const menu = page.locator('.selector-menu:visible')
  await expect(menu.getByText('Choice Beta', { exact: true })).toBeVisible()
  await expect.poll(async () => {
    const menuBox = await menu.boundingBox()
    const rowBox = await menu.getByText('Choice Beta', { exact: true }).boundingBox()

    return menuBox && rowBox ? menuBox.y + menuBox.height - (rowBox.y + rowBox.height) : -1
  }).toBeGreaterThanOrEqual(0)
})

test('opening the menu autofocuses search on every open', async ({ page }) => {
  for (const target of ['.control', '.dropdown-icon']) {
    const control = page.getByTestId('nested-selector').locator(target)
    await control.click({ delay: 150 })
    const input = page.locator('.selector-menu:visible').getByRole('textbox')
    await expect(input).toBeFocused()
    await input.press('Escape')
    await expect(page.locator('.selector-menu:visible')).toHaveCount(0)
  }
})
