import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext, observeRendererDiagnostics } from './renderer-diagnostics.mjs'
import { captureState } from '../visual/capture-state.mjs'
import { assertTreeSourceCommit } from './tree-source-contracts.mjs'

assertRendererDiagnostics(test)

const sortedLabels = ['Alpha', 'Match A', 'Other A', 'Beta', 'Match B', 'Zulu']
const filteredLabels = ['Alpha', 'Match A', 'Beta', 'Match B']

for (const mode of ['filtered', 'custom']) {
  test(`Tree keeps source edits after a model commit, ${mode} search and remount`, async ({ page }) => {
    await page.goto(`/cs-CZ/vapor-tree-initialization?mode=${mode}`)
    await assertTreeSourceCommit(page)
  })
}

test('Tree leaf placeholders preserve geometry and become live collapse buttons when children arrive', async ({ browser, page, baseURL }) => {
  const path = '/cs-CZ/vapor-tree-initialization?mode=known-leaves'
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const server = await context.newPage()
    await server.goto('/cs-CZ/vapor-tree-initialization?mode=sorted')
    await expect(server.locator('.tree-node[data-id="a-match"] .tree-collapse-btn [data-icon]')).toHaveCount(1)
    await server.goto(path)
    await expect(server.locator('.tree-node[data-id="a"] .tree-collapse-btn [data-icon]')).toHaveCount(1)
    await expect(server.locator('.tree-node[data-id="a-match"] .tree-collapse-btn [data-icon]')).toHaveCount(0)
    await expect(server.locator('.tree-node[data-id="a-match"] .tree-collapse-btn')).toBeHidden()
    const link = server.getByRole('link', { name: 'Tree · známé listy a změna potomků', exact: true })
    await expect(link).toHaveAttribute('href', path)
    await link.click()
    await expect(server.locator('.tree-node__content-label')).toHaveText(sortedLabels)
  } finally {
    await context.close()
  }
  await page.goto(path)
  const leaf = page.locator('.tree-node[data-id="a-match"] .tree-collapse-btn')
  const parent = page.locator('.tree-node[data-id="a"] .tree-collapse-btn')
  const child = page.locator('.tree-node[data-id="a-nested"]')
  await expect(page.getByTestId('tree-initialization')).toHaveAttribute('data-ready', 'true')
  const parentBox = await parent.boundingBox()
  const leafBox = await leaf.boundingBox()
  expect(leafBox.width).toBe(parentBox.width)
  expect(leafBox.height).toBe(parentBox.height)
  for (let cycle = 0; cycle < 3; cycle++) {
    await expect(leaf).toBeHidden()
    await expect(leaf.locator('[data-icon]')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle leaf children', exact: true }).click()
    await expect(leaf).toBeVisible()
    await expect(leaf.locator('[data-icon]')).toHaveCount(1)
    await expect(child).toContainText('Nested match')
    await leaf.click()
    await expect(child).toHaveCount(0)
    await leaf.press('Enter')
    await expect(child).toContainText('Nested match')
    await page.getByRole('button', { name: 'Toggle leaf children', exact: true }).click()
    await expect(child).toHaveCount(0)
  }
  await expect(leaf.locator('[data-icon]')).toHaveCount(0)
})

test('a rejected custom search leaves the pending state, exposes its error and recovers', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-tree-initialization?mode=failed')
  await expect(page.getByTestId('tree-initialization')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByTestId('tree-initial-pending')).toBeVisible()
  await page.getByRole('button', { name: 'Reject newest search', exact: true }).click()
  await expect(page.getByTestId('tree-search-error')).toHaveText('Custom search unavailable')
  await expect(page.getByTestId('tree-initial-pending')).toHaveCount(0)
  await expect(page.getByTestId('tree-search-errors')).toHaveText('1')
  await captureState({ page, testInfo, target: page.locator('.tree'), state: 'tree-search-error', families: ['Tree'] })
  await page.getByRole('button', { name: 'Toggle error slot', exact: true }).click()
  await expect(page.locator('.tree .banner[role="alert"]')).toBeVisible()
  await captureState({ page, testInfo, target: page.locator('.tree'), state: 'tree-search-error-fallback', families: ['Tree', 'Banner'] })
  await page.getByRole('button', { name: 'Search Other', exact: true }).click()
  await expect(page.getByTestId('tree-search-error')).toHaveCount(0)
  await page.getByRole('button', { name: 'Resolve newest search', exact: true }).click()
  await expect(page.locator('.tree-node__content')).toHaveText(['Alpha', 'Other A'])
  await page.getByRole('button', { name: 'Search Match', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
  await page.getByRole('button', { name: 'Reject newest search', exact: true }).click()
  await expect(page.getByTestId('tree-search-errors')).toHaveText('1')
  await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
  await page.getByRole('button', { name: 'Resolve newest search', exact: true }).click()
  await expect(page.locator('.tree-node__content')).toHaveText(filteredLabels)
})

test('Tree preserves numeric zero IDs and parent/children search metadata', async ({ page }) => {
  const errors = observeRendererDiagnostics(page)
  await page.goto('/cs-CZ/vapor-tree-initialization?mode=zero')
  await expect(page.getByTestId('tree-initialization')).toHaveAttribute('data-ready', 'true')
  const labels = page.locator('.tree-node__content-label')
  await expect(labels).toHaveText(['Match zero parent', 'Match zero child'])
  await expect(page.locator('.tree-node[data-id="1"] .tree-node__content-path')).toHaveText('Match zero parent')
  await expect(page.locator('.tree-node').first()).toHaveAttribute('data-id', '0')
  await page.getByRole('button', { name: 'Search Missing', exact: true }).click()
  await expect(page.getByTestId('tree-initial-empty')).toBeVisible()
  await page.getByRole('button', { name: 'Search Match', exact: true }).click()
  await expect(labels).toHaveText(['Match zero parent', 'Match zero child'])
  await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
  await expect(labels).toHaveText(['Match zero parent', 'Match zero child'])
  await expect(page.getByRole('link', { name: 'Tree · číselné ID nula', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vapor-tree-initialization?mode=zero')
  expect(errors).toEqual([])
})

for (const mode of ['sorted', 'filtered', 'custom', 'empty']) {
  test(`Tree initializes synchronously and survives remount (${mode})`, async ({ page }) => {
    const errors = observeRendererDiagnostics(page)
    await page.goto(`/cs-CZ/vapor-tree-initialization?mode=${mode}`)
    await expect(page.getByTestId('tree-initialization')).toHaveAttribute('data-ready', 'true')
    const labels = page.locator('.tree-node__content')
    const expected = mode === 'empty' ? [] : mode === 'sorted' ? sortedLabels : filteredLabels
    await expect(labels).toHaveText(expected)
    await expect(page.getByTestId('tree-initial-pending')).toHaveCount(0)
    if (mode !== 'empty') {
      await expect(page.getByTestId('tree-source-order')).toHaveText('b,a')
      await page.getByRole('button', { name: 'Search Other', exact: true }).click()
      await expect(labels).toHaveText(['Alpha', 'Other A'])
      await page.getByRole('button', { name: 'Search Missing', exact: true }).click()
      await expect(labels).toHaveCount(0)
      await expect(page.getByTestId('tree-initial-empty')).toBeVisible()
      await page.getByRole('button', { name: 'Search Match', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
    await expect(page.locator('.tree')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
    await expect(labels).toHaveText(mode === 'empty' ? [] : filteredLabels)
    expect(errors).toEqual([])
  })
}

test('Tree search actions remain reachable in a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/cs-CZ/vapor-tree-initialization?mode=sorted')
  await expect(page.getByTestId('tree-initialization')).toHaveAttribute('data-ready', 'true')
  const tree = page.locator('.tree')
  const treeBox = await tree.boundingBox()
  const actions = tree.locator('.tree__actions')
  await expect(actions.getByRole('button')).toHaveCount(2)
  for (const button of await actions.getByRole('button').all()) {
    const box = await button.boundingBox()
    expect(box.x).toBeGreaterThanOrEqual(treeBox.x)
    expect(box.x + box.width).toBeLessThanOrEqual(treeBox.x + treeBox.width)
    expect(box.x + box.width).toBeLessThanOrEqual(390)
  }
  await actions.getByRole('button').first().click()
  await expect(page.locator('.tree-node__content-label')).toHaveText(['Alpha', 'Beta'])
  await actions.getByRole('button').last().click()
  await expect(page.locator('.tree-node__content-label')).toHaveText(sortedLabels)
})

test('Tree ignores stale custom search results and results from an unmounted owner', async ({ page }) => {
  const errors = observeRendererDiagnostics(page)
  await page.goto('/cs-CZ/vapor-tree-initialization?mode=async')
  await expect(page.getByTestId('tree-initialization')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByTestId('tree-initial-pending')).toBeVisible()
  await expect(page.locator('.tree-node')).toHaveCount(0)
  await expect(page.getByTestId('tree-pending-searches')).toHaveText('Match')
  await page.getByRole('button', { name: 'Search Other', exact: true }).click()
  await expect(page.getByTestId('tree-pending-searches')).toHaveText('Match,Other')
  await page.getByRole('button', { name: 'Resolve newest search', exact: true }).click()
  await expect(page.locator('.tree-node__content')).toHaveText(['Alpha', 'Other A'])
  await expect(page.getByTestId('tree-initial-pending')).toHaveCount(0)
  await page.getByRole('button', { name: 'Resolve oldest search', exact: true }).click()
  await expect(page.locator('.tree-node__content')).toHaveText(['Alpha', 'Other A'])

  await page.getByRole('button', { name: 'Search Match', exact: true }).click()
  await expect(page.getByTestId('tree-pending-searches')).toHaveText('Match')
  await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
  await expect(page.locator('.tree')).toHaveCount(0)
  await page.getByRole('button', { name: 'Resolve oldest search', exact: true }).click()
  await expect(page.getByTestId('tree-pending-searches')).toHaveText('')
  await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
  await expect(page.getByTestId('tree-initial-pending')).toBeVisible()
  await page.getByRole('button', { name: 'Resolve newest search', exact: true }).click()
  await expect(page.locator('.tree-node__content')).toHaveText(filteredLabels)
  expect(errors).toEqual([])
})

test('Tree preserves initial SSR output and localized variant links', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    for (const [mode, label, expected] of [
      ['sorted', 'Tree · počáteční řazení', sortedLabels],
      ['filtered', 'Tree · počáteční hledání', filteredLabels],
      ['custom', 'Tree · vlastní synchronní hledání', filteredLabels],
      ['async', 'Tree · vlastní asynchronní hledání', []],
      ['failed', 'Tree · zotavení z chyby hledání', []],
      ['empty', 'Tree · prázdná inicializace', []],
      ['zero', 'Tree · číselné ID nula', ['Match zero parent', 'Match zero child']],
    ]) {
      const path = `/cs-CZ/vapor-tree-initialization?mode=${mode}`
      const response = await page.goto(path)
      expect(response.status()).toBe(200)
      await expect(page.getByTestId('tree-initialization')).toHaveAttribute('data-ready', 'false')
      await expect(page.locator('.tree-node__content-label')).toHaveText(expected)
      await expect(page.getByTestId('tree-initial-pending')).toHaveCount(mode === 'async' || mode === 'failed' ? 1 : 0)
      await expect(page.getByTestId('tree-initial-empty')).toHaveCount(mode === 'empty' ? 1 : 0)
      await expect(page.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', path)
    }
  } finally {
    await context.close()
  }
})
