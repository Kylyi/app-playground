import { expect, test } from '@playwright/test'

test('input layouts retain label focus, styles, slots and state across renderer changes', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-input-layouts')
  await expect(page.getByTestId('input-layouts-example')).toHaveAttribute('data-ready', 'true')
  const field = page.getByTestId('layout-field')
  const input = field.locator('input')
  let wide = false
  for (const layout of ['regular', 'inline', 'label-inside', 'regular']) {
    await page.getByLabel('Layout', { exact: true }).selectOption(layout)
    await expect(field).toContainText('Layout hint')
    await expect(field.locator('.input-wrapper-border')).toHaveCSS('border-radius', '12px')
    await field.locator('label').click()
    await expect(input).toBeFocused()
    await expect(page.getByText('Layout tooltip', { exact: true })).toHaveCount(1)
    await expect(page.getByText('Layout tooltip', { exact: true })).toBeVisible()
    await expect(input).toHaveCSS('cursor', 'text')
    await input.fill(layout)
    await expect(page.getByTestId('layout-value')).toHaveText(layout)
    await page.getByRole('button', { name: 'Select input', exact: true }).click()
    expect(await input.evaluate(el => el.selectionEnd - el.selectionStart)).toBe(layout.length)
    await page.getByRole('button', { name: 'Resize prepend', exact: true }).click()
    wide = !wide
    await expect(page.getByTestId('layout-prepend')).toHaveCSS('width', wide ? '120px' : '60px')
    await page.getByRole('button', { name: 'Toggle prepend', exact: true }).click()
    await expect(page.getByTestId('layout-prepend')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle prepend', exact: true }).click()
    await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
    await expect(input).toHaveAttribute('readonly', '')
    await expect(input).toHaveCSS('cursor', 'default')
    await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
    await page.getByRole('button', { name: 'Toggle disabled', exact: true }).click()
    await expect(input).toBeDisabled()
    await expect(input).toHaveCSS('cursor', 'not-allowed')
    await page.getByRole('button', { name: 'Toggle disabled', exact: true }).click()
    await page.getByRole('button', { name: 'Toggle loading', exact: true }).click()
    await expect(field.locator('.loading')).toBeVisible()
    await page.getByRole('button', { name: 'Toggle loading', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(input).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await page.getByRole('button', { name: 'Focus input', exact: true }).click()
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('regular')
  expect(problems).toEqual([])
})

test('input layout renders label, hint and localized navigation during SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-input-layouts')
    const field = page.getByTestId('layout-field')
    await expect(field.locator('label')).toHaveText('Layout label')
    await expect(field).toContainText('Layout hint')
    await expect(field.locator('input')).toHaveValue('')
    await expect(page.getByRole('link', { name: 'InputWrapper · layouty a label', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-input-layouts')
    for (const [mode, label] of [
      ['inline', 'InputWrapper · inline'],
      ['label-inside', 'InputWrapper · label uvnitř'],
    ]) {
      const link = page.getByRole('link', { name: label, exact: true })
      await expect(link).toHaveAttribute('href', `/cs-CZ/vapor-input-layouts?mode=${mode}`)
      await link.click()
      await expect(page.getByLabel('Layout', { exact: true })).toHaveValue(mode)
      await expect(page.getByTestId('layout-field').locator('label')).toHaveText('Layout label')
    }
  } finally {
    await context.close()
  }
})
