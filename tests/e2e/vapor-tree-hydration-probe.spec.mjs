import { expect, test } from '@playwright/test'

for (const provided of [false, true]) {
  test(`native forwarded slot hydrates without warnings (provided=${provided})`, async ({ page }) => {
    const warnings = []
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (/\[Vue warn\]: Hydration|Hydration completed|no active component|no.*Suspense.*boundary/i.test(message.text())) {
        warnings.push(message.text())
      }
    })
    await page.goto(`/cs-CZ/vapor-tree-hydration-probe${provided ? '?mode=provided' : ''}`)
    const probe = page.getByTestId('hydration-probe')
    await expect(probe).toHaveAttribute('data-ready', 'true')
    await expect(probe).toContainText('Hydration child')
    await expect(probe.getByText('Provided content', { exact: true })).toHaveCount(provided ? 1 : 0)
    await probe.getByRole('button', { name: 'Following sibling', exact: true }).click()
    await expect(page.getByTestId('hydration-probe-clicks')).toHaveText('1')
    expect(errors).toEqual([])
    if (!provided) {
      // Only the identified mismatch is expected; earlier functional failures stay red.
      expect(warnings.filter(message => !/Hydration children mismatch|Hydration completed/i.test(message))).toEqual([])
      test.fail(true, 'HY01: Vue rc.9 trims a sibling slot boundary after an empty forwarded slot.')
    }
    expect(warnings).toEqual([])
  })
}

test('hydration probe preserves both SSR variants and localized navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-tree-hydration-probe')
    for (const [provided, label, path] of [
      [false, 'Tree · hydratace prázdného slotu', '/cs-CZ/vapor-tree-hydration-probe'],
      [true, 'Tree · hydratace předaného obsahu', '/cs-CZ/vapor-tree-hydration-probe?mode=provided'],
    ]) {
      const link = page.getByRole('link', { name: label, exact: true })
      await expect(link).toHaveAttribute('href', path)
      await link.click()
      const probe = page.getByTestId('hydration-probe')
      await expect(probe).toHaveAttribute('data-ready', 'false')
      await expect(probe).toContainText('Hydration child')
      await expect(probe.getByText('Provided content', { exact: true })).toHaveCount(provided ? 1 : 0)
      await expect(page.getByTestId('hydration-probe-clicks')).toHaveText('0')
    }
  } finally {
    await context.close()
  }
})
