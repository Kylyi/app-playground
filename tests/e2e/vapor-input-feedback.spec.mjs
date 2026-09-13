import { expect, test } from '@playwright/test'

test('five inputs clear once after confirmation and keep values on cancellation', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  await page.goto('/cs-CZ/vapor-input-feedback')
  await expect(page.getByTestId('feedback-example')).toHaveAttribute('data-ready', 'true')
  const counts = { text: 0, number: 0, area: 0, color: 0, icon: 0 }
  for (const name of Object.keys(counts)) {
    const field = page.getByTestId(`clear-${name}`)
    const input = field.locator('input, textarea')
    const original = await input.inputValue()
    const clear = field.locator('button').filter({ has: page.locator('.i-eva\\:close-fill') })
    await clear.click()
    const confirm = page.locator('[data-cy="confirm-delete"]')
    await expect(confirm).toBeVisible()
    await expect(input).toHaveValue(original)
    await page.keyboard.press('Escape')
    await expect(confirm).toHaveCount(0)
    await expect(input).toHaveValue(original)
    await clear.click()
    await confirm.click()
    await expect(confirm).toHaveCount(0)
    await expect(input).toHaveValue('')
    counts[name]++
    await expect(page.getByTestId('clear-counts')).toHaveText(JSON.stringify(counts))
  }
  expect(problems).toEqual([])
})

test('hint fallback, function values and error transitions survive remount', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-input-feedback')
  await expect(page.getByTestId('feedback-example')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByTestId('hint')).toHaveText('Ready to edit')
  await page.getByRole('button', { name: 'Toggle errors', exact: true }).click()
  await expect(page.getByTestId('errors')).toContainText('First error')
  await expect(page.getByTestId('errors')).toContainText('Second error')
  await expect(page.getByTestId('hint')).toHaveText('Review values')
  await page.getByRole('button', { name: 'Toggle hint', exact: true }).click()
  await expect(page.getByTestId('hint')).toHaveText('Custom hint')
  await page.getByRole('button', { name: 'Toggle hint', exact: true }).click()
  await expect(page.getByTestId('hint')).toHaveText('Review values')
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(page.getByTestId('errors')).toContainText('First error')
  await page.getByRole('button', { name: 'Toggle errors', exact: true }).click()
  await expect(page.getByTestId('errors')).not.toBeVisible()
  expect(problems).toEqual([])
})

test('feedback example renders initial hint and localized link without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-input-feedback')
    await expect(page.getByTestId('hint')).toHaveText('Ready to edit')
    await expect(page.getByTestId('clear-icon').locator('input')).toHaveValue('carbon:search')
    await expect(page.getByRole('link', { name: 'Input · potvrzení, hint a chyby', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-input-feedback')
  } finally {
    await context.close()
  }
})
