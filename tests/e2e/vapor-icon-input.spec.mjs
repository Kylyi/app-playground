import { expect, test } from '@playwright/test'

for (const mobile of [false, true]) {
  test(`IconInput keeps its model, picker and public methods working (mobile=${mobile})`, async ({ page }) => {
    const problems = []
    page.on('pageerror', error => problems.push(error.message))
    page.on('console', message => {
      if (/hydration|no active component/i.test(message.text())) {
        problems.push(message.text())
      }
    })
    await page.route('https://api.iconify.design/search?*', route => route.fulfill({ json: { icons: ['carbon:search', 'carbon:close'] } }))
    if (mobile) {
      await page.setViewportSize({ width: 390, height: 844 })
    }
    await page.goto('/cs-CZ/vapor-icon-input')
    await expect(page.getByTestId('icon-input-example')).toHaveAttribute('data-ready', 'true')
    const field = page.getByTestId('icon-input-field')
    const input = field.locator('input')
    const items = page.locator('.icon-picker__content-item')
    await input.fill('sea')
    await expect(page.getByTestId('icon-input-value')).toHaveText('sea')
    await expect(items).toHaveCount(2)
    await items.last().click()
    await expect(input).toHaveValue('carbon:close')
    await expect(page.getByTestId('icon-input-value')).toHaveText('carbon:close')
    await expect(items).toHaveCount(0)
    await page.getByRole('button', { name: 'Select input', exact: true }).click()
    await expect(input).toBeFocused()
    expect(await input.evaluate(el => [el.selectionStart, el.selectionEnd])).toEqual([0, 12])
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Blur input', exact: true }).click()
    await expect(input).not.toBeFocused()
    await field.locator('.input-wrapper__regular-append').getByRole('button').click()
    await expect(input).toHaveValue('')
    await expect(page.getByTestId('icon-input-clears')).toHaveText('1')
    await page.getByRole('button', { name: 'Replace model', exact: true }).click()
    await expect(input).toHaveValue('carbon:search')
    await page.getByRole('button', { name: 'Clear input', exact: true }).click()
    await expect(input).toHaveValue('')
    await expect(page.getByTestId('icon-input-clears')).toHaveText('2')
    await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
    await input.click()
    await expect(input).toHaveAttribute('readonly', '')
    await expect(items).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
    await expect(input).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
    await page.getByRole('button', { name: 'Focus input', exact: true }).click()
    await expect(input).toBeFocused()
    await input.fill('sea')
    await expect(items).toHaveCount(2)
    await page.keyboard.press('Escape')
    expect(problems).toEqual([])
  })
}

test('IconInput renders its native input and localized link during SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-icon-input')
    await expect(page.getByTestId('icon-input-field').locator('input')).toHaveAttribute('placeholder', 'Choose icon')
    await expect(page.locator('.icon-picker')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'IconInput · picker a focus', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-icon-input')
  } finally {
    await context.close()
  }
})
