import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { assertRendererDiagnostics, createObservedContext, observeRendererDiagnostics } from './renderer-diagnostics.mjs'
import { expectSelectionCleared, expectSelectionDisabled } from './gesture-selection.mjs'

assertRendererDiagnostics(test)

test('Tree keyboard navigation expands, selects and releases the owner', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-tree-drag?controls=true')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  await page.locator('.tree__content').focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('.tree-node.is-focused')).toHaveAttribute('data-id', 'node-1')
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.tree-node')).toHaveCount(3)
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('.tree-node.is-focused')).toHaveAttribute('data-id', 'node-2')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('tree-selection')).toHaveText('node-2')
  await page.getByRole('button', { name: 'Toggle tree', exact: true }).click()
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('.tree-node')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle tree', exact: true }).click()
  await page.locator('.tree__content').focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('.tree-node.is-focused')).toHaveAttribute('data-id', 'node-1')
})

test('Tabs and confirmation support keyboard operation with accessible controls', async ({ page }) => {
  const manifest = page.waitForResponse(response => response.url().includes('/builds/meta/'))
  await page.goto('/cs-CZ/vapor-tabs')
  expect(await (await manifest).finished()).toBeNull()
  await expect(page.getByTestId('tabs-example')).toHaveAttribute('data-ready', 'true')
  const beta = page.locator('.tabs-navigation').getByRole('tab', { name: 'Beta', exact: true })
  await beta.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('panel-beta')).toBeVisible()
  await expect(beta).toBeFocused()
  const results = await new AxeBuilder({ page }).include('[data-testid="tabs-example"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(results.violations).toEqual([])
  await page.goto('/cs-CZ/vapor-menu-confirmation')
  await expect(page.getByTestId('menu-confirmation')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Open confirmation', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(page.locator('[data-cy="confirm-delete"]')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-cy="confirm-delete"]')).toHaveCount(0)
  await expect(page.getByTestId('confirmation-count')).toHaveText('0')
})

test('touch users can change panels and confirm without a mouse', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, hasTouch: true, viewport: { width: 390, height: 844 } })
  try {
    const page = await context.newPage()
    const errors = observeRendererDiagnostics(page)
    await page.goto('/cs-CZ/vapor-tabs')
    await expect(page.getByTestId('tabs-example')).toHaveAttribute('data-ready', 'true')
    await page.locator('.tabs-navigation').getByRole('tab', { name: 'Beta', exact: true }).tap()
    await expect(page.getByTestId('panel-beta')).toBeVisible()
    await page.getByRole('button', { name: 'Count beta: 0', exact: true }).tap()
    await expect(page.getByTestId('panel-beta')).toContainText('Count beta: 1')
    await page.goto('/cs-CZ/vapor-menu-confirmation')
    await expect(page.getByTestId('menu-confirmation')).toHaveAttribute('data-ready', 'true')
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).tap()
    await page.locator('[data-cy="confirm-delete"]').tap()
    await expect(page.getByTestId('confirmation-count')).toHaveText('1')
    await expect(page.locator('[data-cy="confirm-delete"]')).toHaveCount(0)
    expect(errors).toEqual([])
  } finally {
    await context.close()
  }
})

test('touch pointer cancellation releases movement and resize listeners', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-element-movement')
  await expect(page.getByTestId('element-movement')).toHaveAttribute('data-ready', 'true')
  for (const selector of ['[data-testid="move-handle"]', '.resize-handles__bottom-right']) {
    await page.locator(selector).evaluate(el => {
      const box = el.getBoundingClientRect()
      const point = { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 }
      el.dispatchEvent(new PointerEvent('pointerdown', { ...point, pointerType: 'touch', pointerId: 5, bubbles: true, button: 0 }))
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: point.clientX + 40, clientY: point.clientY + 30, pointerType: 'touch', pointerId: 5 }))
    })
    await expectSelectionDisabled(page)
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel', { pointerType: 'touch', pointerId: 5 })))
    const stopped = await page.getByTestId('dimensions').textContent()
    await page.mouse.move(50, 50)
    await expect(page.getByTestId('dimensions')).toHaveText(stopped)
    await expectSelectionCleared(page)
  }
})

test('movement restores an existing selection rule after release and owner removal', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-element-movement')
  await expect(page.getByTestId('element-movement')).toHaveAttribute('data-ready', 'true')
  await page.locator('body').evaluate(el => {
    const property = CSS.supports('user-select', 'none') ? 'user-select' : '-webkit-user-select'
    el.style.setProperty(property, 'text', 'important')
  })
  for (const removeOwner of [false, true]) {
    const box = await page.getByTestId('move-handle').boundingBox()
    await page.mouse.move(box.x + 20, box.y + 20)
    await page.mouse.down()
    await expectSelectionDisabled(page)
    if (removeOwner) {
      await page.getByRole('button', { name: 'Toggle movement', exact: true }).evaluate(el => el.click())
    }
    await page.mouse.up()
    expect(await page.locator('body').evaluate(el => {
      const property = CSS.supports('user-select', 'none') ? 'user-select' : '-webkit-user-select'

      return [el.style.getPropertyValue(property), el.style.getPropertyPriority(property)]
    })).toEqual(['text', 'important'])
  }
})
