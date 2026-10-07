import { expect, test } from '@playwright/test'

for (const mode of ['wrapped', 'direct']) {
  test(`VDOM ${mode} children dispose after hydration and remount`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (/hydration|no active component/i.test(message.text())) {
        errors.push(message.text())
      }
    })
    await page.goto(`/cs-CZ/vapor-interop-lifecycle?mode=${mode}`)
    await expect(page.getByTestId('interop-lifecycle')).toHaveAttribute('data-ready', 'true')
    const expected = []
    for (let cycle = 1; cycle <= 2; cycle++) {
      await expect(page.getByText('VDOM child', { exact: true })).toHaveCount(1)
      await page.evaluate(() => window.dispatchEvent(new Event('interop-lifecycle-ping')))
      await page.getByRole('button', { name: 'Hide children', exact: true }).click()
      await expect(page.getByText('VDOM child', { exact: true })).toHaveCount(0)
      await page.evaluate(() => window.dispatchEvent(new Event('interop-lifecycle-ping')))
      expected.push('mounted', 'ping', 'beforeUnmount', 'disposed', 'unmounted')
      await expect(page.getByTestId('interop-events')).toHaveText(JSON.stringify(expected))
      if (cycle === 1) {
        await page.getByRole('button', { name: 'Show children', exact: true }).click()
      }
    }
    expect(errors).toEqual([])
  })
}

test('interop lifecycle navigation switches modes and retains cleanup behavior', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-interop-lifecycle')
  await expect(page.getByTestId('interop-lifecycle')).toHaveAttribute('data-ready', 'true')
  for (const [mode, label] of [
    ['direct', 'Lifecycle · přímé odebrání VDOM'],
    ['wrapped', 'Lifecycle · VDOM uvnitř Vapor wrapperu'],
  ]) {
    await page.getByRole('link', { name: label, exact: true }).click()
    await expect(page.getByTestId('interop-lifecycle')).toHaveAttribute('data-ready', 'true')
    await expect(page.getByTestId('interop-lifecycle').getByRole('heading')).toContainText(mode)
    await expect(page.getByText('VDOM child', { exact: true })).toHaveCount(1)
    // app.vue keys examples by mode, so client navigation starts a fresh log.
    await expect(page.getByTestId('interop-events')).toHaveText('["mounted"]')
    await page.evaluate(() => window.dispatchEvent(new Event('interop-lifecycle-ping')))
    await page.getByRole('button', { name: 'Hide children', exact: true }).click()
    await expect(page.getByText('VDOM child', { exact: true })).toHaveCount(0)
    await page.evaluate(() => window.dispatchEvent(new Event('interop-lifecycle-ping')))
    await expect(page.getByTestId('interop-events'))
      .toHaveText('["mounted","ping","beforeUnmount","disposed","unmounted"]')
  }
})

test('interop lifecycle example preserves SSR and localized variant links', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-interop-lifecycle')
    for (const [mode, label, path] of [
      ['wrapped', 'Lifecycle · VDOM uvnitř Vapor wrapperu', '/cs-CZ/vapor-interop-lifecycle'],
      ['direct', 'Lifecycle · přímé odebrání VDOM', '/cs-CZ/vapor-interop-lifecycle?mode=direct'],
    ]) {
      const link = page.getByRole('link', { name: label, exact: true })
      await expect(link).toHaveAttribute('href', path)
      await link.click()
      await expect(page.getByTestId('interop-lifecycle').getByRole('heading')).toContainText(mode)
      await expect(page.getByText('VDOM child', { exact: true })).toHaveCount(1)
      await expect(page.getByTestId('interop-events')).toHaveText('[]')
      await expect(page.getByTestId('interop-lifecycle')).toHaveAttribute('data-ready', 'false')
    }
  } finally {
    await context.close()
  }
})
