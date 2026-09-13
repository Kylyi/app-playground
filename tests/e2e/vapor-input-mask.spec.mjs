import { expect, test } from '@playwright/test'

test('native Vapor mask edits, reformats and releases replaced inputs and owners', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component|onMounted is called|onUnmounted is called/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-input-mask')
  const input = page.getByRole('textbox', { name: 'Masked number' })
  const model = page.getByTestId('mask-model')
  await expect(page.getByTestId('mask-owner')).toHaveAttribute('data-live', 'true')
  await expect(input).toHaveValue('12,50')
  await input.focus()
  await input.evaluate(el => el.setSelectionRange(1, 1))
  await page.keyboard.type('9')
  await expect(input).toHaveValue('192,50')
  await expect.poll(() => input.evaluate(el => el.selectionStart)).toBe(2)
  await expect(model).toHaveText('192.5')
  await page.getByRole('button', { name: 'Change radix' }).click()
  await expect(input).toHaveValue('192.50')
  await expect(model).toHaveText('192.5')
  await page.getByRole('button', { name: 'Clear model' }).click()
  await expect(input).toHaveValue('')
  await page.getByRole('button', { name: 'Set zero' }).click()
  await expect(input).toHaveValue('0.00')
  await input.fill('23.75')
  await expect(model).toHaveText('23.75')

  for (const name of ['Toggle input', 'Toggle owner']) {
    const accepted = await page.getByTestId('mask-accepted').textContent()
    const detached = await input.elementHandle()
    await page.getByRole('button', { name, exact: true }).click()
    await expect(input).toHaveCount(0)
    if (name === 'Toggle input') {
      await expect(page.getByTestId('mask-owner')).toHaveAttribute('data-live', 'false')
    }
    await detached.evaluate(el => {
      el.value = '99.99'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await expect(model).toHaveText('23.75')
    await expect(page.getByTestId('mask-accepted')).toHaveText(accepted)
    await page.getByRole('button', { name, exact: true }).click()
    await expect(input).toHaveValue('23.75')
    await input.fill('24.25')
    await expect(model).toHaveText('24.25')
    await input.fill('23.75')
    await expect(model).toHaveText('23.75')
    await detached.dispose()
  }
  expect(problems).toEqual([])
})

test('Vapor mask formats the SSR value without a live DOM mask', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-input-mask')
    await expect(page.getByRole('textbox', { name: 'Masked number' })).toHaveValue('12,50')
    await expect(page.getByTestId('mask-owner')).toHaveAttribute('data-live', 'false')
    await expect(page.getByRole('link', { name: 'Input · maska a lifecycle', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-input-mask')
  } finally {
    await context.close()
  }
})

test('VDOM number, currency and date inputs keep typed model semantics through the shared adapter', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/cs-CZ/vapor-input-mask')
  await expect(page.getByTestId('mask-owner')).toHaveAttribute('data-live', 'true')
  for (const [name, value, model] of [['number', '23,75', '23.75'], ['currency', '99,50', '99.5'], ['date', '21.06.2026', '2026-06-21']]) {
    const section = page.getByTestId(`mask-${name}`)
    const input = section.locator('input')
    await input.fill(value)
    await input.blur()
    await expect(section.locator('output')).toHaveText(model)
  }
  expect(errors).toEqual([])
})
