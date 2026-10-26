import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

for (const mode of ['static', 'direct-fallback', 'provided', 'forwarded-fallback']) {
  test(`native ${mode} children dispose after hydration`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (/hydration|no active component/i.test(message.text())) {
        errors.push(message.text())
      }
    })
    await page.goto(`/cs-CZ/vapor-slot-lifecycle?mode=${mode}`)
    await expect(page.getByTestId('slot-lifecycle')).toHaveAttribute('data-ready', 'true')
    for (let cycle = 1; cycle <= 2; cycle++) {
      await expect(page.getByText('Native child', { exact: true })).toHaveCount(1)
      await page.evaluate(() => window.dispatchEvent(new Event('slot-lifecycle-ping')))
      await page.getByRole('button', { name: 'Hide children' }).click()
      await expect(page.getByText('Native child', { exact: true })).toHaveCount(0)
      // A removed child's listener must stay inactive, including after remount.
      await page.evaluate(() => window.dispatchEvent(new Event('slot-lifecycle-ping')))
      const events = JSON.parse(await page.getByTestId('slot-events').textContent())
      for (const event of ['mounted', 'beforeUnmount', 'disposed', 'unmounted', 'ping']) {
        expect(events.filter(value => value === event), event).toHaveLength(cycle)
      }
      if (cycle === 1) {
        await page.getByRole('button', { name: 'Show children' }).click()
      }
    }
    expect(errors).toEqual([])
  })
}

test('slot lifecycle example has deterministic SSR and localized navigation', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-slot-lifecycle')
    await expect(page.getByText('Native child', { exact: true })).toHaveCount(1)
    await expect(page.getByTestId('slot-events')).toHaveText('[]')
    await expect(page.getByTestId('slot-lifecycle')).toHaveAttribute('data-ready', 'false')
    await expect(page.getByRole('link', { name: 'Sloty · lifecycle fallbacku', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-slot-lifecycle')
    await expect(page.getByRole('link', { name: 'Sloty · předaný obsah', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-slot-lifecycle?mode=provided')
    await page.goto('/cs-CZ/vapor-slot-lifecycle?mode=provided')
    await expect(page.getByText('Native child', { exact: true })).toHaveCount(1)
    await expect(page.getByTestId('slot-events')).toHaveText('[]')
  } finally {
    await context.close()
  }
})
