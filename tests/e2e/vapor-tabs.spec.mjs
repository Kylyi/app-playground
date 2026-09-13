import { expect, test } from '@playwright/test'

for (const mode of ['cached', 'plain', 'filtered']) {
  test(`tabs render Vapor content with ${mode} lifecycle`, async ({ page }) => {
    const problems = []
    page.on('pageerror', error => problems.push(error.message))
    page.on('console', message => {
      if (/hydration|no active component|outside of the render function/i.test(message.text())) {
        problems.push(message.text())
      }
    })
    await page.goto(`/cs-CZ/vapor-tabs?mode=${mode}`)
    await expect(page.getByTestId('tabs-example')).toHaveAttribute('data-ready', 'true')
    const nav = page.locator('.tabs-navigation')
    await expect(nav.getByRole('button', { name: /Alpha|Beta|Gamma/ })).toHaveText(['Alpha', 'Beta', 'Gamma'])
    await expect(page.getByTestId('panel-alpha')).toContainText('Owner context')
    await page.getByRole('button', { name: 'Count alpha: 0', exact: true }).click()
    await nav.getByRole('button', { name: 'Beta', exact: true }).click()
    await expect(page.getByTestId('panel-alpha')).toHaveCount(0)
    await page.getByRole('button', { name: 'Count beta: 0', exact: true }).click()
    await page.getByRole('button', { name: 'Update context', exact: true }).click()
    await nav.getByRole('button', { name: 'Alpha', exact: true }).click()
    await expect(page.getByTestId('panel-alpha')).toContainText('Updated owner context')
    await expect(page.getByTestId('panel-alpha')).toContainText(`Count alpha: ${mode === 'plain' ? 0 : 1}`)
    await page.getByRole('button', { name: 'Rename Alpha', exact: true }).click()
    await page.getByRole('button', { name: 'Reverse tabs', exact: true }).click()
    await expect(nav.getByRole('button', { name: /Alpha|Beta|Gamma/ })).toHaveText(['Gamma', 'Beta', 'Renamed Alpha'])
    await expect(page.getByTestId('panel-alpha')).toContainText(`Count alpha: ${mode === 'plain' ? 0 : 1}`)
    await expect(page.locator('.tab')).toHaveCSS('padding', '13px')
    await nav.getByRole('button', { name: 'Beta', exact: true }).click()
    await expect(page.getByTestId('panel-beta')).toContainText(`Count beta: ${mode === 'cached' ? 1 : 0}`)
    await page.getByRole('button', { name: 'Toggle custom navigation', exact: true }).click()
    await expect(nav).toHaveCount(0)
    await page.getByRole('button', { name: 'Custom gamma', exact: true }).click()
    await page.getByRole('button', { name: 'Count gamma: 0', exact: true }).click()
    await page.getByRole('button', { name: 'Toggle Gamma', exact: true }).click()
    await expect(page.locator('.tab')).toHaveCount(0)
    await expect(page.getByTestId('active-tab')).toHaveText('gamma')
    await page.getByRole('button', { name: 'Toggle Gamma', exact: true }).click()
    await expect(page.getByTestId('panel-gamma')).toContainText('Count gamma: 0')
    await page.getByRole('button', { name: 'Toggle custom navigation', exact: true }).click()
    await expect(nav.getByRole('button', { name: /Alpha|Beta|Gamma/ })).toHaveText(['Gamma', 'Beta', 'Renamed Alpha'])
    await page.getByRole('button', { name: 'Toggle tabs owner', exact: true }).click()
    await expect(page.locator('.tab')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle tabs owner', exact: true }).click()
    await expect(page.getByTestId('panel-gamma')).toContainText('Count gamma: 0')
    expect(problems).toEqual([])
  })
}

test('KeepAlive max evicts the least recently used panel', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-tabs')
  await expect(page.getByTestId('tabs-example')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Count alpha: 0', exact: true }).click()
  const nav = page.locator('.tabs-navigation')
  for (const name of ['Beta', 'Gamma', 'Alpha']) {
    await nav.getByRole('button', { name, exact: true }).click()
  }
  await expect(page.getByTestId('panel-alpha')).toContainText('Count alpha: 0')
})

test('tabs navigation and selected panel render during SSR with localized variants', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-tabs')
    await expect(page.locator('.tabs-navigation').getByRole('button', { name: /Alpha|Beta|Gamma/ })).toHaveText(['Alpha', 'Beta', 'Gamma'])
    await expect(page.getByTestId('panel-alpha')).toContainText('Owner context')
    await expect(page.getByTestId('panel-beta')).toHaveCount(0)
    for (const [name, suffix] of [['Tabs · cache panelů', ''], ['Tabs · bez cache', '?mode=plain'], ['Tabs · filtry cache', '?mode=filtered']]) {
      await expect(page.getByRole('link', { name, exact: true })).toHaveAttribute('href', `/cs-CZ/vapor-tabs${suffix}`)
    }
  } finally {
    await context.close()
  }
})

test('nested Tab declarations work without items or v-model and isolate nested Tabs', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component|outside of the render function/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-tabs?mode=basic')
  const outer = page.getByTestId('basic-tabs')
  await expect(outer).toHaveAttribute('data-ready', 'true')
  await expect(outer.locator('.tab')).toHaveText('Content')
  await expect(outer.getByRole('button', { name: /^tab[12]$/ })).toHaveText(['tab1', 'tab2'])
  await expect(page.getByTestId('inner-tabs')).toHaveCount(0)
  await outer.getByRole('button', { name: 'tab2', exact: true }).click()
  await expect(page.getByTestId('inner-tabs').locator('.tab')).toHaveText('Nested content')
  await expect(page.getByTestId('inner-tabs').getByRole('button', { name: 'inner', exact: true })).toBeVisible()
  await outer.getByRole('button', { name: 'tab1', exact: true }).click()
  await expect(outer.locator('.tab')).toHaveText('Content')
  await expect(page.getByTestId('inner-tabs')).toHaveCount(0)
  expect(problems).toEqual([])
})

test('literal nested Tab syntax renders the first panel and navigation in SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-tabs?mode=basic')
    const outer = page.getByTestId('basic-tabs')
    await expect(outer.locator('.tab')).toHaveText('Content')
    await expect(outer.getByRole('button', { name: /^tab[12]$/ })).toHaveText(['tab1', 'tab2'])
    await expect(page.getByTestId('inner-tabs')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Tabs · vnořené Tab', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-tabs?mode=basic')
  } finally {
    await context.close()
  }
})

test('native panel cache activates, deactivates and disposes content', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-tabs')
  await expect(page.getByTestId('tabs-example')).toHaveAttribute('data-ready', 'true')
  const events = page.getByTestId('tab-lifecycle')
  const nav = page.locator('.tabs-navigation')
  await expect(events).toContainText('alpha:activated')
  await expect(events).not.toContainText('beta:mounted')
  await nav.getByRole('button', { name: 'Beta', exact: true }).click()
  await expect(events).toContainText('alpha:deactivated')
  await nav.getByRole('button', { name: 'Alpha', exact: true }).click()
  await expect.poll(async () => JSON.parse(await events.textContent()).filter(event => event === 'alpha:activated').length).toBe(2)
  expect(JSON.parse(await events.textContent()).filter(event => event === 'alpha:mounted')).toHaveLength(1)
  await nav.getByRole('button', { name: 'Gamma', exact: true }).click()
  await expect(events).toContainText('beta:unmounted')
  await page.getByRole('button', { name: 'Toggle tabs owner', exact: true }).click()
  await expect(events).toContainText('alpha:unmounted')
  await expect(events).toContainText('gamma:unmounted')
})
