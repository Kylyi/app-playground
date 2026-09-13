import { expect, test } from '@playwright/test'

for (const mobile of [false, true]) {
  test(`MenuProxy preserves slot fallbacks and scoped hide (mobile=${mobile})`, async ({ page }) => {
    const problems = []
    page.on('pageerror', error => problems.push(error.message))
    page.on('console', message => {
      if (/hydration|no active component/i.test(message.text())) {
        problems.push(message.text())
      }
    })
    if (mobile) {
      await page.setViewportSize({ width: 390, height: 844 })
    }
    await page.goto('/cs-CZ/vapor-menu-proxy')
    await expect(page.getByTestId('menu-proxy-example')).toHaveAttribute('data-ready', 'true')
    const overlay = page.locator(mobile ? '.dialog__wrapper' : '.menu')
    const control = name => page.getByRole('button', { name, exact: true }).evaluate(el => el.click())
    await page.getByRole('button', { name: 'Open proxy', exact: true }).click()
    await expect(overlay).toBeVisible()
    await expect(overlay).toContainText('Fallback title')
    await expect(page.getByTestId('proxy-header-right')).toHaveCount(0)
    await control('Toggle header right')
    await expect(overlay.getByTestId('proxy-header-right')).toHaveText('Header action')
    await control('Toggle title slot')
    await expect(overlay).not.toContainText('Fallback title')
    await control('Update title')
    await overlay.getByRole('button', { name: 'Updated title', exact: true }).click()
    await expect(overlay).toHaveCount(0)
    await expect(page.getByTestId('proxy-model')).toHaveText('false')
    await page.getByRole('button', { name: 'Open proxy', exact: true }).click()
    await control('Toggle title slot')
    await control('Toggle header right')
    await expect(overlay).toContainText('Fallback title')
    await expect(page.getByTestId('proxy-header-right')).toHaveCount(0)
    await control('Toggle header slot')
    await expect(overlay).not.toContainText('Fallback title')
    await overlay.getByRole('button', { name: 'Close custom header', exact: true }).click()
    await expect(overlay).toHaveCount(0)
    await control('Toggle header slot')
    await page.getByRole('button', { name: 'Open proxy', exact: true }).click()
    await expect(overlay).toContainText('Fallback title')
    await overlay.getByRole('button', { name: 'Close proxy content', exact: true }).click()
    await expect(overlay).toHaveCount(0)
    expect(problems).toEqual([])
  })
}

test('MenuProxy starts closed during SSR and has a localized example link', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-menu-proxy')
    await expect(page.getByTestId('proxy-model')).toHaveText('false')
    await expect(page.locator('.menu, .dialog__wrapper')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'MenuProxy · sloty a fallback', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-menu-proxy')
  } finally {
    await context.close()
  }
})
