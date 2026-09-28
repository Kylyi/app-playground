import { expect, test } from '@playwright/test'

function iconImage(locator) {
  return locator.evaluate(element => {
    const style = getComputedStyle(element)

    return [style.maskImage, style.webkitMaskImage, style.backgroundImage].find(value => value?.includes('url(')) ?? ''
  })
}

test('native Stepper navigates linearly and renders its icons natively', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-stepper')
  await expect(page.getByTestId('stepper-example')).toHaveAttribute('data-ready', 'true')

  const items = page.locator('.stepper-item')
  const triggers = page.locator('.stepper-trigger')
  const account = page.getByTestId('step-account')
  const profile = page.getByTestId('step-profile')
  const done = page.getByTestId('step-done')

  // Without a model the first step is active; linear mode locks the steps not reached yet
  await expect(items).toHaveCount(3)
  await expect(triggers.nth(0)).toHaveAttribute('aria-current', 'step')
  await expect(triggers.nth(1)).toBeDisabled()
  await expect(triggers.nth(2)).toBeDisabled()
  await expect(account).toBeVisible()
  await expect(profile).toHaveCount(0)
  await expect(items.nth(0).locator('.stepper-description')).toHaveText('Sign-in details')

  // Step icon given as a UnoCSS class renders through the native IconRenderer
  const accountIcon = items.nth(0).locator('.stepper-indicator > span.i-lucide\\:user')
  await expect(accountIcon).toHaveCount(1)
  expect(await iconImage(accountIcon)).toContain('url(')
  await expect(items.nth(1).locator('.stepper-indicator')).toHaveText('2')

  await page.getByRole('button', { name: 'Next step', exact: true }).click()
  await expect(page.getByTestId('active-step')).toHaveText('profile')
  await expect(profile).toBeVisible()
  await expect(account).toHaveCount(0)
  await expect(items.nth(0)).toHaveClass(/is-completed/)
  await expect(items.nth(0).locator('.stepper-separator')).toHaveClass(/is-completed/)

  // The canonical default `lucide:check` maps to its UnoCSS icon class
  const completedIcon = items.nth(0).locator('.stepper-indicator > span.i-lucide\\:check')
  await expect(completedIcon).toHaveCount(1)
  expect(await iconImage(completedIcon)).toContain('url(')

  await page.getByRole('button', { name: 'Toggle profile error', exact: true }).click()
  const errorIcon = items.nth(1).locator('.stepper-indicator > span.i-lucide\\:x')
  await expect(items.nth(1)).toHaveClass(/is-error/)
  await expect(errorIcon).toHaveCount(1)
  expect(await iconImage(errorIcon)).toContain('url(')
  await page.getByRole('button', { name: 'Toggle profile error', exact: true }).click()
  await expect(items.nth(1)).toHaveClass(/is-active/)

  // Reached steps stay clickable in linear mode, later ones do not
  await expect(triggers.nth(2)).toBeDisabled()
  await triggers.nth(0).click()
  await expect(page.getByTestId('active-step')).toHaveText('account')
  await expect(account).toBeVisible()
  await triggers.nth(1).click()
  await expect(page.getByTestId('active-step')).toHaveText('profile')

  // An external model change moves past the linear lock
  await page.getByRole('button', { name: 'Set external step', exact: true }).click()
  await expect(done).toBeVisible()
  await expect(triggers.nth(2)).toHaveAttribute('aria-current', 'step')
  await expect(items.nth(1)).toHaveClass(/is-completed/)

  await page.getByRole('button', { name: 'Previous step', exact: true }).click()
  await expect(page.getByTestId('active-step')).toHaveText('profile')
  await expect(done).toHaveCount(0)
  expect(errors).toEqual([])
})

test('Stepper and its localized navigation render on the server', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-stepper')
    await expect(page.locator('.stepper-item')).toHaveCount(3)
    await expect(page.locator('.stepper-trigger').first()).toHaveAttribute('aria-current', 'step')
    await expect(page.locator('.stepper-trigger').nth(1)).toBeDisabled()
    await expect(page.getByTestId('step-account')).toBeVisible()
    await expect(page.getByTestId('step-profile')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Stepper · kroky a ikony', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-stepper')
  } finally {
    await context.close()
  }
})
