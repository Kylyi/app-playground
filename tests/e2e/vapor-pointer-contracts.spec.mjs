import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics } from './renderer-diagnostics.mjs'
import { expectSelectionCleared, expectSelectionDisabled } from './gesture-selection.mjs'

assertRendererDiagnostics(test)

test('pen pointer cancellation releases movement and resize ownership', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-element-movement')
  await expect(page.getByTestId('element-movement')).toHaveAttribute('data-ready', 'true')
  for (const selector of ['[data-testid="move-handle"]', '.resize-handles__bottom-right']) {
    const before = JSON.parse(await page.getByTestId('dimensions').textContent())
    await page.locator(selector).evaluate(el => {
      const box = el.getBoundingClientRect()
      const point = { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 }
      const pointer = { pointerType: 'pen', pointerId: 7, button: 0, buttons: 1, bubbles: true }
      el.dispatchEvent(new PointerEvent('pointerdown', { ...point, ...pointer }))
      window.dispatchEvent(new PointerEvent('pointermove', {
        ...pointer,
        clientX: point.clientX + 60,
        clientY: point.clientY + 40,
      }))
    })
    await expectSelectionDisabled(page)
    const field = selector.includes('move-handle') ? 'x' : 'w'
    await expect.poll(async () => JSON.parse(await page.getByTestId('dimensions').textContent())[field])
      .toBeGreaterThan(before[field] + 40)
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel', {
      pointerType: 'pen',
      pointerId: 7,
      bubbles: true,
    })))
    await expectSelectionCleared(page)
    const stopped = await page.getByTestId('dimensions').textContent()
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointermove', {
      pointerType: 'pen',
      pointerId: 7,
      buttons: 1,
      clientX: 50,
      clientY: 50,
      bubbles: true,
    })))
    await expect(page.getByTestId('dimensions')).toHaveText(stopped)
  }
})

test('pen activates pickers while preserving editable keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 844 })
  for (const picker of [
    { path: 'vapor-date-time-inputs', ready: 'date-time-example', field: 'date-field' },
    { path: 'vapor-date-time-inputs', ready: 'date-time-example', field: 'time-field' },
    { path: 'vapor-color-inputs', ready: 'color-inputs-example', field: 'color-input-field' },
  ]) {
    await page.goto(`/cs-CZ/${picker.path}`)
    await expect(page.getByTestId(picker.ready)).toHaveAttribute('data-ready', 'true')
    const input = page.getByTestId(picker.field).locator('input').first()
    await input.evaluate(el => {
      const point = { pointerType: 'pen', pointerId: 7, button: 0, bubbles: true, cancelable: true }
      el.dispatchEvent(new PointerEvent('pointerdown', { ...point, buttons: 1 }))
      el.dispatchEvent(new PointerEvent('pointerup', { ...point, buttons: 0 }))
      el.dispatchEvent(new PointerEvent('click', point))
    })
    await expect(page.locator('.menu')).toHaveAttribute('data-open', 'true')
    await expect(input).not.toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.locator('.menu')).toHaveCount(0)
    await input.focus()
    await expect(input).toBeFocused()
    await expect(page.locator('.menu')).toHaveAttribute('data-open', 'true')
    await page.keyboard.press('Escape')
    await expect(page.locator('.menu')).toHaveCount(0)
  }
})
