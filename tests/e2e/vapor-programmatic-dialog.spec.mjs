import { expect, test } from '@playwright/test'

test('programmatic dialog host preserves context, slots and independent close handles', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-programmatic-dialog')
  await expect(page.getByTestId('programmatic-dialog')).toHaveAttribute('data-ready', 'true')
  const dialogs = page.locator('.dialog__wrapper')
  await page.getByRole('button', { name: 'Open declarative dialog', exact: true }).click()
  await expect(dialogs).toHaveCount(1)
  await expect(dialogs.getByTestId('injected-dialog-content')).toHaveText('Owner context')
  await page.getByRole('button', { name: 'Update context', exact: true }).evaluate(el => el.click())
  await expect(dialogs.getByTestId('injected-dialog-content')).toHaveText('Updated owner context')
  await page.getByRole('button', { name: 'Toggle close permission', exact: true }).evaluate(el => el.click())
  await page.getByRole('button', { name: 'Close last dialog', exact: true }).evaluate(el => el.click())
  await expect(page.getByTestId('close-attempts')).toHaveText('1')
  await expect(dialogs).toHaveAttribute('data-open', 'true')
  await page.getByRole('button', { name: 'Toggle close permission', exact: true }).evaluate(el => el.click())
  await dialogs.getByRole('button', { name: 'Close through slot', exact: true }).click()
  await expect(dialogs).toHaveCount(0)
  await expect(page.getByTestId('hidden-count')).toHaveText('1')
  await expect(page.getByTestId('dialog-count')).toHaveText('0')

  await page.getByRole('button', { name: 'Open legacy content', exact: true }).click()
  await expect(dialogs.getByTestId('injected-dialog-content')).toHaveText('Updated owner context')
  await page.getByRole('button', { name: 'Open declarative dialog', exact: true }).evaluate(el => el.click())
  await expect(dialogs).toHaveCount(2)
  await page.getByRole('button', { name: 'Close last dialog', exact: true }).evaluate(el => el.click())
  await expect(dialogs).toHaveCount(1)
  await expect(dialogs).toContainText('Legacy content')
  await page.keyboard.press('Escape')
  await expect(dialogs).toHaveCount(0)
  await expect(page.getByTestId('hidden-count')).toHaveText('3')
  await page.getByRole('button', { name: 'Open legacy content', exact: true }).click()
  await dialogs.getByRole('button', { name: 'Close legacy header', exact: true }).click()
  await expect(dialogs).toHaveCount(0)
  await expect(page.getByTestId('hidden-count')).toHaveText('4')
  expect(problems).toEqual([])
})

test('owner disposal removes open dialogs and can mount again', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-programmatic-dialog')
  await expect(page.getByTestId('programmatic-dialog')).toHaveAttribute('data-ready', 'true')
  for (let index = 0; index < 2; index++) {
    await page.getByRole('button', { name: 'Open declarative dialog', exact: true }).click()
    await expect(page.locator('.dialog__wrapper')).toHaveCount(1)
    await page.getByRole('button', { name: 'Toggle dialog owner', exact: true }).evaluate(el => el.click())
    await expect(page.locator('.dialog__wrapper, .backdrop')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle dialog owner', exact: true }).click()
  }
  await expect(page.getByTestId('hidden-count')).toHaveText('0')
})

test('programmatic host has no SSR dialogs and is linked in localized navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-programmatic-dialog')
    await expect(page.getByTestId('dialog-count')).toHaveText('0')
    await expect(page.locator('.dialog__wrapper, .backdrop')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Dialog · programatické API', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-programmatic-dialog')
  } finally {
    await context.close()
  }
})
