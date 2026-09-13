import { expect, test } from '@playwright/test'

test('dialog anchors follow targets, event types and native Vapor owner lifetime', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-dialog-anchor')
  const model = page.getByTestId('native-dialog-model')
  const toggles = page.getByTestId('native-toggles')
  const a = page.getByRole('button', { name: 'Target A', exact: true })
  const b = page.getByRole('button', { name: 'Target B', exact: true })
  await expect(model).toHaveAttribute('data-ready', 'true')
  await a.click()
  await expect(toggles).toHaveText('1')
  await page.getByRole('button', { name: 'Use A', exact: true }).click()
  await b.click()
  await expect(toggles).toHaveText('1')
  await a.click()
  await expect(toggles).toHaveText('2')
  await page.getByRole('button', { name: 'Use B', exact: true }).click()
  await a.click()
  await expect(toggles).toHaveText('2')
  await b.click()
  await expect(toggles).toHaveText('3')
  await page.getByRole('button', { name: 'Toggle event' }).click()
  await b.click()
  await expect(toggles).toHaveText('3')
  await b.dispatchEvent('contextmenu')
  await expect(toggles).toHaveText('4')
  await page.getByRole('button', { name: 'Toggle manual' }).click()
  await b.dispatchEvent('contextmenu')
  await expect(toggles).toHaveText('4')
  await page.getByRole('button', { name: 'Toggle manual' }).click()
  await b.dispatchEvent('contextmenu')
  await expect(toggles).toHaveText('5')
  await page.getByRole('button', { name: 'Toggle owner' }).click()
  await b.dispatchEvent('contextmenu')
  await expect(toggles).toHaveText('5')
  await page.getByRole('button', { name: 'Toggle owner' }).click()
  await expect(model).toHaveAttribute('data-ready', 'true')
  await b.dispatchEvent('contextmenu')
  await expect(toggles).toHaveText('6')

  for (let i = 0; i < 2; i++) {
    await page.getByTestId('real-dialog-trigger').click()
    await expect(page.getByTestId('real-dialog-model')).toHaveText('true')
    await page.getByTestId('real-dialog-close').click()
    await expect(page.getByTestId('real-dialog-model')).toHaveText('false')
    await expect(page.getByTestId('real-dialog-close')).toHaveCount(0)
  }
  expect(errors).toEqual([])
})

test('dialog declaration and native owner render on the server without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  try {
    const response = await page.goto('/vapor-dialog-anchor')
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('dialog-anchor-page')).toHaveAttribute('data-ready', 'false')
    await expect(page.getByTestId('native-dialog-model')).toHaveText('false')
    await expect(page.getByTestId('real-dialog-trigger')).toBeVisible()
    await expect(page.getByTestId('real-dialog-model')).toHaveText('false')
    await expect(page.getByTestId('real-dialog-close')).toHaveCount(0)
  } finally {
    await context.close()
  }
})

test('MenuProxy hydrates and switches between mobile Dialog and desktop Menu', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/selector-vapor')
  await expect(page.getByTestId('selector-fixture')).toHaveAttribute('data-ready', 'true')
  for (const [width, label] of [[390, 'Alpha'], [1280, 'Beta'], [390, 'Gamma']]) {
    await page.setViewportSize({ width, height: 844 })
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.getByTestId('selector').locator('.control').click()
    const surface = page.locator(width === 390 ? '.dialog.selector-menu:visible' : '.menu.selector-menu:visible')
    await expect(surface).toBeVisible()
    await surface.getByText(label, { exact: true }).click()
    await expect(page.getByTestId('selector')).toContainText(label)
    await expect(surface).toHaveCount(0)
  }
  expect(errors).toEqual([])
})
