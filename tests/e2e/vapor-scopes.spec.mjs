import { expect, test } from '@playwright/test'

test('Vapor owners isolate files and validation registrations and clean up on remount', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || (message.type() === 'warning' && /hydration/i.test(message.text()))) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-scopes')
  await expect(page.getByTestId('scope-probe')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByTestId('parts')).toHaveText('4')
  await expect(page.getByTestId('owners')).toHaveText('4')
  await expect(page.getByTestId('errors')).toHaveText('4')
  await page.getByTestId('validate-owners').click()
  await expect(page.getByTestId('visible-owners')).toHaveText('4')
  await page.getByTestId('add-first').click()
  await page.getByTestId('add-second').click()
  await expect(page.getByTestId('files')).toHaveText('first.txt,second.txt')
  await page.getByTestId('toggle-owner').click()
  await expect(page.getByTestId('parts')).toHaveText('2')
  await expect(page.getByTestId('owners')).toHaveText('2')
  await expect(page.getByTestId('visible-owners')).toHaveText('2')
  await expect(page.getByTestId('errors')).toHaveText('2')
  await expect(page.getByTestId('files')).toHaveText('second.txt')
  await page.getByTestId('toggle-owner').click()
  await expect(page.getByTestId('parts')).toHaveText('4')
  await expect(page.getByTestId('owners')).toHaveText('4')
  await expect(page.getByTestId('visible-owners')).toHaveText('2')
  await page.getByTestId('add-first').click()
  await expect(page.getByTestId('files')).toHaveText('first.txt,second.txt')
  expect(errors).toEqual([])
})

test('server renders scope owners without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto(new URL('/vapor-scopes', baseURL).href)
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('add-first')).toBeVisible()
    await expect(page.getByTestId('add-second')).toBeVisible()
    await expect(page.getByTestId('scope-probe')).toHaveAttribute('data-ready', 'false')
  } finally {
    await context.close()
  }
})
