import { expect, test } from '@playwright/test'

test('VDOM and Vapor ripple follow live values and dispose listeners and animations', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-ripple')
  await expect(page.getByTestId('ripple-example')).toHaveAttribute('data-ready', 'true')
  // Hold animations so their lifecycle can be asserted without racing CSS duration.
  await page.addStyleTag({ content: '.ripple { animation: none !important; }' })
  const ids = ['native-ripple', 'vdom-ripple', 'chip-ripple']
  for (const id of ids) {
    await page.getByTestId(id).click({ position: { x: 4, y: 4 } })
    await expect(page.getByTestId(id).locator(':scope > .ripple-container')).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Toggle ripple', exact: true }).click()
  for (const id of ids) {
    const target = page.getByTestId(id)
    await target.click({ position: { x: 4, y: 4 } })
    await expect(target.locator(':scope > .ripple-container')).toHaveCount(1)
    await target.locator(':scope > .ripple-container > .ripple').dispatchEvent('animationend')
    await expect(target.locator(':scope > .ripple-container')).toHaveCount(0)
  }
  const beforeRemove = await page.getByTestId('bubbled').textContent()
  await page.getByRole('button', { name: 'Remove chip', exact: true }).click()
  await expect(page.getByTestId('removed')).toHaveText('1')
  await expect(page.getByTestId('bubbled')).toHaveText(beforeRemove)
  await expect(page.getByTestId('chip-ripple').locator(':scope > .ripple-container')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle chip link', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Vapor chip', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vapor-ripple')
  await page.getByTestId('chip-ripple').click({ position: { x: 4, y: 4 } })
  await expect(page.getByTestId('chip-ripple').locator(':scope > .ripple-container')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle chip link', exact: true }).click()

  await page.getByRole('button', { name: 'Toggle disabled', exact: true }).click()
  for (const id of ids.slice(0, 2)) {
    await expect(page.getByTestId(id)).toBeDisabled()
    await page.getByTestId(id).dispatchEvent('click')
    await expect(page.getByTestId(id).locator(':scope > .ripple-container')).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Toggle disabled', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle ripple', exact: true }).click()
  for (const id of ids) {
    await page.getByTestId(id).click({ position: { x: 4, y: 4 } })
    await expect(page.getByTestId(id).locator(':scope > .ripple-container')).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Toggle ripple', exact: true }).click()
  for (const id of ids) {
    await page.getByTestId(id).click({ position: { x: 4, y: 4 } })
    await expect(page.getByTestId(id).locator(':scope > .ripple-container')).toHaveCount(1)
  }
  const detached = await page.getByTestId('owners').evaluateHandle(el => Array.from(el.children))
  await page.getByRole('button', { name: 'Toggle owners', exact: true }).click()
  expect(await detached.evaluate(elements => elements.map(el => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    return el.querySelectorAll('.ripple-container').length
  }))).toEqual([0, 0, 0])
  await detached.dispose()
  await page.getByRole('button', { name: 'Toggle owners', exact: true }).click()
  for (const id of ids) {
    await page.getByTestId(id).click({ position: { x: 4, y: 4 } })
    await expect(page.getByTestId(id).locator(':scope > .ripple-container')).toHaveCount(1)
  }
  expect(errors).toEqual([])
})

test('ripple and native Chip render with SSR and localized navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-ripple')
    await expect(page.getByTestId('chip-ripple')).toContainText('Vapor chip')
    await expect(page.getByRole('button', { name: 'Remove chip', exact: true })).toBeVisible()
    await expect(page.locator('.ripple-container')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Ripple a Chip · Vapor', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-ripple')
  } finally {
    await context.close()
  }
})
