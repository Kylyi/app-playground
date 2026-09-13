import { expect, test } from '@playwright/test'

test('native component targets follow their exposed element through replacement and getters', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-floating-target')
  await expect(page.getByTestId('floating-target-page')).toHaveAttribute('data-ready', 'true')
  const menu = page.getByTestId('target-menu')
  const tooltip = page.getByTestId('target-tooltip')
  const action = name => page.getByRole('button', { name, exact: true }).dispatchEvent('click')
  const a = page.getByTestId('target-a')
  const oldTarget = await a.elementHandle()
  await page.getByTestId('target-wrapper').dispatchEvent('click')
  await expect(menu).toHaveCount(0)
  await a.dispatchEvent('click')
  await expect(menu).toBeVisible()
  await action('Close menu')
  await a.dispatchEvent('mouseenter')
  await expect(tooltip).toBeVisible()
  const initialPosition = await tooltip.boundingBox()
  await action('Swap element')
  const b = page.getByTestId('target-b')
  await expect(b).toBeVisible()
  await expect.poll(async () => (await tooltip.boundingBox()).x).toBeGreaterThan(initialPosition.x + 100)
  await oldTarget.dispatchEvent('mouseleave')
  await oldTarget.dispatchEvent('click')
  await expect(menu).toHaveCount(0)
  await expect(tooltip).toBeVisible()
  await b.dispatchEvent('mouseleave')
  await expect(tooltip).toHaveCount(0)
  await b.dispatchEvent('click')
  await expect(menu).toBeVisible()
  await action('Close menu')

  for (const mode of ['Use component getter', 'Use selector getter']) {
    await action(mode)
    await b.dispatchEvent('click')
    await expect(menu).toBeVisible()
    await action('Close menu')
    await b.dispatchEvent('mouseenter')
    await expect(tooltip).toBeVisible()
    await b.dispatchEvent('mouseleave')
    await expect(tooltip).toHaveCount(0)
  }

  await action('Use component getter')
  await b.dispatchEvent('mouseenter')
  await expect(tooltip).toBeVisible()
  await action('Toggle target component')
  await expect(tooltip).toHaveCount(0)
  await action('Toggle target component')
  await b.dispatchEvent('click')
  await expect(menu).toBeVisible()
  await action('Close menu')
  expect(errors).toEqual([])
})

test('component target refs are safe before hydration', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-floating-target')
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('target-a')).toBeVisible()
    await expect(page.getByTestId('floating-target-page')).toHaveAttribute('data-ready', 'false')
    await expect(page.getByTestId('target-menu')).toHaveCount(0)
    await expect(page.getByTestId('target-tooltip')).toHaveCount(0)
  } finally {
    await context.close()
  }
})
