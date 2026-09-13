import { expect, test } from '@playwright/test'

test('hide selects explicit DOM owners and preserves filtering, boundaries and persistence', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-hide')
  await expect(page.getByTestId('hide-fixture')).toHaveAttribute('data-ready', 'true')
  const models = page.getByTestId('hide-models')
  // Exercise the command handler even when a teleported overlay covers the controls.
  const action = name => page.getByRole('button', { name, exact: true }).dispatchEvent('click')
  const open = async () => {
    await action('Force all')
    await expect(page.locator('.floating-element')).toHaveCount(0)
    await action('Open overlays')
    await expect(page.locator('.floating-element')).toHaveCount(3)
    await expect(models).toHaveText('true/true/true')
  }

  await open()
  await action('Hide missing target')
  await expect(models).toHaveText('true/true/true')
  await action('Ignore latest')
  await expect(models).toHaveText('true/true/true')
  await action('Hide latest')
  await expect(models).toHaveText('true/true/false')
  await open()
  await action('Hide outer target')
  await expect(models).toHaveText('true/false/true')
  await open()
  await action('Hide inner target')
  await expect(models).toHaveText('true/true/false')
  await open()
  await action('Hide dialog target')
  await expect(models).toHaveText('false/true/true')
  await open()
  await action('Hide after outer')
  await expect(models).toHaveText('true/true/false')
  await open()
  await action('Keep outer')
  await expect(models).toHaveText('false/true/false')
  await open()
  await action('Hide menus')
  await expect(models).toHaveText('true/false/false')
  await action('Hide latest dialog')
  await expect(models).toHaveText('false/false/false')
  await open()
  await action('Toggle persistent')
  await action('Hide all')
  await expect(models).toHaveText('true/true/true')
  await action('Hide dialog target')
  await expect(models).toHaveText('true/true/true')
  await action('Force all')
  await expect(models).toHaveText('false/false/false')
  expect(errors).toEqual([])
})

test('hide is safe during server rendering', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-hide')
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('hide-models')).toHaveText('false/false/false')
    await expect(page.getByTestId('hide-fixture')).toHaveAttribute('data-ready', 'false')
  } finally {
    await context.close()
  }
})
