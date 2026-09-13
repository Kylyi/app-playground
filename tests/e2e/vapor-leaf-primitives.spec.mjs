import { expect, test } from '@playwright/test'

test('leaf primitives preserve models, slots, DOM state and remount', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })

  await page.goto('/cs-CZ/vapor-leaf-primitives')
  await expect(page.getByTestId('leaf-primitives-example')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByTestId('leaf-badge')).toHaveText('2')
  await expect(page.getByTestId('leaf-badge-slot')).toHaveText('custom badge')
  await expect(page.getByTestId('leaf-burger').locator('path').first())
    .toHaveAttribute('d', 'M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7')
  await expect(page.getByTestId('button-group-value')).toHaveText('left')
  await expect(page.getByTestId('leaf-item-readonly')).toHaveClass(/is-readonly/)
  await expect(page.getByTestId('leaf-item-readonly').locator('.focus-helper')).toHaveCount(0)
  await page.getByRole('button', { name: 'Increment badge', exact: true }).click()
  await expect(page.getByTestId('leaf-badge')).toHaveText('3')
  await expect(page.getByTestId('leaf-shortcut')).toContainText('K')
  await expect(page.getByTestId('leaf-checkmark').locator('path')).toHaveCSS('animation-delay', '0.01s')
  await expect(page.getByTestId('leaf-close').locator('path').first()).toHaveCSS('animation-delay', '0.02s')
  await expect(page.getByTestId('leaf-indeterminate').locator('path')).toHaveCSS('animation-delay', '0.03s')
  await expect(page.getByTestId('leaf-radio-icon').locator('.inner')).toHaveClass(/unchecked/)
  const movementDelay = await page.getByTestId('leaf-movement-element').evaluate(element => {
    return Number.parseFloat(getComputedStyle(element).getPropertyValue('--delay'))
  })
  expect(movementDelay).toBeGreaterThanOrEqual(0)
  expect(movementDelay).toBeLessThan(2000)
  await expect(page.getByTestId('leaf-radio-first')).toHaveClass(/is-checked/)

  await page.getByTestId('leaf-burger').click()
  await expect(page.getByTestId('burger-value')).toHaveText('true')
  await page.getByRole('button', { name: 'Right option', exact: true }).click()
  await expect(page.getByTestId('button-group-value')).toHaveText('right')
  await page.getByTestId('leaf-item').click()
  await expect(page.getByTestId('item-clicks')).toHaveText('1')
  await page.getByRole('button', { name: 'Toggle radio icon', exact: true }).click()
  await expect(page.getByTestId('leaf-radio-icon').locator('.inner')).toHaveClass(/is-checked/)
  await page.getByTestId('leaf-radio-second').click()
  await expect(page.getByTestId('radio-value')).toHaveText('second')
  await page.getByTestId('leaf-radio-disabled').click()
  await expect(page.getByTestId('radio-value')).toHaveText('second')

  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(page.getByTestId('leaf-primitives-owner')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(page.getByTestId('leaf-badge')).toHaveText('3')
  await expect(page.getByTestId('burger-value')).toHaveText('true')
  await expect(page.getByTestId('leaf-burger').locator('path').first())
    .toHaveAttribute('d', 'M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7')
  await expect(page.getByTestId('button-group-value')).toHaveText('right')
  await expect(page.getByTestId('radio-value')).toHaveText('second')
  expect(problems).toEqual([])
})

test('leaf primitives and localized navigation render during SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-leaf-primitives')
    await expect(page.getByTestId('leaf-badge')).toHaveText('2')
    await expect(page.getByTestId('leaf-badge-slot')).toHaveText('custom badge')
    await expect(page.getByTestId('leaf-burger').locator('path').first())
      .toHaveAttribute('d', 'M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7')
    await expect(page.getByTestId('button-group-value')).toHaveText('left')
    await expect(page.getByTestId('leaf-item')).toHaveText('Clickable item')
    await expect(page.getByTestId('leaf-shortcut')).toHaveCount(0)
    await expect(page.getByTestId('leaf-movement-element')).toHaveAttribute('style', /--delay:\s*0ms/)
    await expect(page.getByTestId('leaf-radio-first')).toHaveClass(/is-checked/)
    await expect(page.getByRole('link', { name: 'Leaf prvky · Vapor', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-leaf-primitives')
  } finally {
    await context.close()
  }
})
