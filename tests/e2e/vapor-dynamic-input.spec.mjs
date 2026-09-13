import { expect, test } from '@playwright/test'

test('DynamicInput forwards conditional scoped slots and preserves its public input API', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-dynamic-input')
  await expect(page.getByTestId('dynamic-input-example')).toHaveAttribute('data-ready', 'true')
  const field = page.getByTestId('dynamic-input-field')
  const input = field.locator('input')
  const decorations = field.locator('.input-wrapper__regular-prepend > *, .input-wrapper__regular-append > *')
  await expect(input).toHaveValue('Alpha')
  await expect(input).toHaveAttribute('placeholder', 'Dynamic value')
  await expect(decorations).toHaveCount(0)
  await page.getByRole('button', { name: 'Select input', exact: true }).click()
  await expect(input).toBeFocused()
  expect(await input.evaluate(el => [el.selectionStart, el.selectionEnd])).toEqual([0, 5])

  for (const initial of ['Alpha', '42']) {
    await expect(input).toHaveValue(initial)
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    await expect(field.getByRole('button')).toHaveCount(2)
    await field.getByRole('button', { name: 'Slot focus', exact: true }).click()
    await expect(input).toBeFocused()
    await input.fill('73')
    await expect(page.getByTestId('dynamic-input-value')).toHaveText('73')
    await field.getByRole('button', { name: 'Slot clear', exact: true }).click()
    await expect(input).toHaveValue('')
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    await expect(decorations).toHaveCount(0)
    if (initial === 'Alpha') {
      await page.getByRole('button', { name: 'Change input type', exact: true }).click()
    }
  }
  await page.getByRole('button', { name: 'Toggle input owner', exact: true }).click()
  await expect(input).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle input owner', exact: true }).click()
  await page.getByRole('button', { name: 'Focus input', exact: true }).click()
  await expect(input).toBeFocused()
  expect(problems).toEqual([])
})

test('DynamicInput renders SSR without phantom slots and has localized navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-dynamic-input')
    const field = page.getByTestId('dynamic-input-field')
    await expect(field.locator('input')).toHaveValue('Alpha')
    await expect(field.locator('input')).toHaveAttribute('placeholder', 'Dynamic value')
    await expect(field.locator('.input-wrapper__regular-prepend > *, .input-wrapper__regular-append > *')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'DynamicInput · sloty a typy', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-dynamic-input')
  } finally {
    await context.close()
  }
})
