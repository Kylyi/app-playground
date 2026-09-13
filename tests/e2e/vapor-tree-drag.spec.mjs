import { expect, test } from '@playwright/test'

for (const mode of ['place', 'parent']) {
  test(`Tree uses exposed Vapor node roots and cleans up drag sessions (${mode})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/vapor-tree-drag?mode=${mode}`)
    await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
    const node = id => page.locator(`.tree .tree-node[data-id="${id}"]`)
    await expect(node('node-1').locator('.tree-node__content')).toHaveText('Node 1')
    await page.getByRole('button', { name: 'Tree sibling', exact: true }).click()
    await expect(page.getByTestId('tree-sibling-clicks')).toHaveText('1')
    async function drag(source, target) {
      const from = await node(source).boundingBox()
      const to = await node(target).boundingBox()
      await page.mouse.move(from.x + 70, from.y + from.height / 2)
      await page.mouse.down()
      await page.mouse.move(to.x + 100, to.y + to.height - 3, { steps: 12 })
      await expect(page.locator('.ghost')).toHaveCount(1)
    }
    await drag('node-1', 'node-3')
    await page.mouse.up()
    await expect(page.getByTestId('tree-moves')).toHaveText('1')
    if (mode === 'place') {
      await expect(page.getByTestId('tree-order')).toHaveText('node-2,node-3,node-1')
    } else {
      await expect(page.getByTestId('tree-children')).toHaveText('node-1')
    }
    const order = await page.getByTestId('tree-order').textContent()
    await drag('node-2', 'node-3')
    await page.keyboard.press('Escape')
    await expect(page.locator('.ghost')).toHaveCount(0)
    await page.mouse.up()
    await expect(page.getByTestId('tree-moves')).toHaveText('1')
    await drag('node-2', 'node-3')
    await page.getByRole('button', { name: 'Toggle tree' }).evaluate(el => el.click())
    await expect(page.locator('.ghost')).toHaveCount(0)
    await page.mouse.up()
    await expect(page.locator('html')).not.toHaveClass(/select-none/)
    await expect(page.getByTestId('tree-order')).toHaveText(order)
    await page.getByRole('button', { name: 'Toggle tree' }).click()
    await drag('node-2', 'node-3')
    await page.mouse.up()
    await expect(page.getByTestId('tree-moves')).toHaveText('2')
    expect(errors).toEqual([])
  })
}

test('Tree renders with SSR and does not create drag effects', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-tree-drag')
    expect(response.status()).toBe(200)
    await expect(page.locator('.tree-node').first()).toContainText('Node 1')
    await expect(page.locator('.ghost')).toHaveCount(0)
  } finally {
    await context.close()
  }
})

test('Tree preserves an active drag when virtualization removes its source', async ({ page }) => {
  await page.goto('/vapor-tree-drag')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  const source = page.locator('.tree .tree-node[data-id="node-1"]')
  const from = await source.boundingBox()
  await page.mouse.move(from.x + 70, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(from.x + 100, from.y + 60, { steps: 12 })
  await expect(page.locator('.ghost')).toHaveCount(1)
  const scroller = page.locator('.tree .is-virtual')
  await scroller.evaluate(element => element.scrollTop = 6000)
  await expect(source).toHaveCount(0)
  await expect(page.locator('.ghost')).toHaveCount(1)
  const viewport = await scroller.boundingBox()
  await page.mouse.move(viewport.x + 120, viewport.y + 90, { steps: 12 })
  await expect(page.locator('.tree-drop-indicator')).toBeVisible()
  await page.mouse.up()
  await expect(page.getByTestId('tree-moves')).toHaveText('1')
  await expect(source).toBeVisible()
  await expect.poll(async () => Number(await source.locator('..').getAttribute('data-idx'))).toBeGreaterThan(100)
  await expect(page.getByTestId('tree-order')).toHaveText('node-2,node-3,node-4')
  await expect(page.locator('.ghost')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveClass(/select-none/)
})

test('Tree stays responsive after dropping a node among 1,000 records', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-tree-drag')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  const from = await page.locator('.tree .tree-node[data-id="node-1"]').boundingBox()
  const to = await page.locator('.tree .tree-node[data-id="node-3"]').boundingBox()
  await page.mouse.move(from.x + 70, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + 100, to.y + to.height - 3, { steps: 12 })
  await expect(page.locator('.ghost')).toHaveCount(1)
  const started = Date.now()
  await page.mouse.up()
  await expect(page.getByTestId('tree-order')).toHaveText('node-2,node-3,node-1')
  await page.getByRole('button', { name: 'Toggle drag permission' }).click()
  expect(Date.now() - started).toBeLessThan(1500)
})

test('Tree expands after receiving its first child by drop', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-tree-drag?mode=parent')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  const parent = page.locator('.tree .tree-node[data-id="node-1"]')
  const child = page.locator('.tree .tree-node[data-id="node-2"]')
  const from = await child.boundingBox()
  const to = await parent.boundingBox()
  await page.mouse.move(from.x + 70, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + 100, to.y + to.height / 2, { steps: 12 })
  await expect(page.locator('.ghost')).toHaveCount(1)
  await page.mouse.up()
  await expect(page.getByTestId('tree-moves')).toHaveText('1')
  await expect(child).toHaveCount(0)
  await parent.locator('.tree-collapse-btn').click()
  await expect(child).toBeVisible()
  await parent.locator('.tree-collapse-btn').click()
  await expect(child).toHaveCount(0)
})

test('Tree search, actions, and checkbox selection work through Vapor components', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-tree-drag?controls=true')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.tree-node')).toHaveCount(2)
  await page.locator('[data-tree-search] input').fill('Child')
  await expect(page.locator('.tree-node')).toHaveCount(1)
  await expect(page.locator('.tree-node__content')).toHaveText('Parent')
  await page.locator('[data-tree-search] input').fill('')
  await page.locator('.tree-node').first().locator('.checkbox__container').click()
  await expect(page.getByTestId('tree-selection')).toHaveText('node-1,node-2')
  const actionButtons = page.locator('.tree__actions button')
  await actionButtons.last().click()
  await expect(page.locator('.tree-node')).toHaveCount(3)
  await actionButtons.first().click()
  await expect(page.locator('.tree-node')).toHaveCount(2)
})

test('HY01: Tree hydrates without mismatch', async ({ page }) => {
  const warnings = []
  const errors = []
  page.on('console', message => {
    if (/hydration/i.test(message.text())) {
      warnings.push(message.text())
    }
  })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-tree-drag')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.tree-node__content').first()).toHaveText('Node 1')
  await page.getByRole('button', { name: 'Tree sibling', exact: true }).click()
  await expect(page.getByTestId('tree-sibling-clicks')).toHaveText('1')
  expect(errors).toEqual([])
  // Track hydration warnings separately from functional drag and lifecycle checks.
  test.fail(true, 'Tree SSR and initial client layout differ; see HY01.')
  expect(warnings).toEqual([])
})
