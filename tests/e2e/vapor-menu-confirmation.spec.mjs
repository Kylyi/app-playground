import { expect, test } from '@playwright/test'

for (const mobile of [false, true]) {
  test(`confirmation focus and stages survive remount (mobile=${mobile})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    if (mobile) {
      await page.setViewportSize({ width: 390, height: 844 })
    }
    await page.goto('/vapor-menu-confirmation')
    await expect(page.getByTestId('menu-confirmation')).toHaveAttribute('data-ready', 'true')
    const confirm = page.locator('[data-cy="confirm-delete"]')
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).click()
    await expect(confirm).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('confirmation-count')).toHaveText('1')
    await expect(confirm).toHaveCount(0)

    await page.getByRole('button', { name: 'Toggle second stage' }).click()
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).click()
    await expect(confirm).toBeFocused()
    await confirm.click()
    await expect(page.getByTestId('confirmed-message')).toBeVisible()
    await expect(page.getByTestId('confirmation-state')).toHaveText('true')
    await expect(confirm).toHaveCount(0)
    await page.getByRole('button', { name: 'Close confirmation', exact: true }).evaluate(el => el.click())
    await expect(page.getByTestId('confirmation-state')).toHaveText('false')
    await expect(page.getByTestId('confirmation-hides')).toHaveText('2')

    await page.getByRole('button', { name: 'Toggle confirmation owner' }).click()
    await page.getByRole('button', { name: 'Toggle confirmation owner' }).click()
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).click()
    await expect(confirm).toBeFocused()
    await page.getByRole('button', { name: 'Focus confirm', exact: true }).evaluate(el => {
      el.focus()
      el.click()
    })
    await expect(confirm).toBeFocused()
    await page.getByRole('button', { name: 'Toggle confirmation owner' }).evaluate(el => el.click())
    await expect(confirm).toHaveCount(0)
    await page.getByRole('button', { name: 'Focus link' }).click()
    await expect(page.getByRole('link', { name: 'Example link', exact: true })).toBeFocused()
    expect(errors).toEqual([])
  })
}

test('confirmation example renders closed with SSR and localized navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-menu-confirmation')
    await expect(page.getByRole('button', { name: 'Open confirmation', exact: true })).toBeVisible()
    await expect(page.locator('[data-cy="confirm-delete"]')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'MenuConfirmation · focus', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-menu-confirmation')
  } finally {
    await context.close()
  }
})
