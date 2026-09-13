import { expect, test } from '@playwright/test'

test('filled label stays aligned throughout hydration and prepend resizing', async ({ page }) => {
  await page.addInitScript(() => {
    window.prependOffsets = []
    const sample = () => {
      const wrapper = document.querySelectorAll('[data-testid="prepend-preview"] .wrapper')[1]
      const label = wrapper?.querySelector('label')
      const body = wrapper?.querySelector('.input-wrapper__regular')
      if (label && body && getComputedStyle(label).position === 'absolute') {
        window.prependOffsets.push(label.getBoundingClientRect().left - body.getBoundingClientRect().left)
      }
      // Read after rendering: ResizeObserver compensates layout changes after
      // rAF callbacks but before paint. Reading inside rAF sees that interim state.
      requestAnimationFrame(() => setTimeout(sample, 0))
    }
    requestAnimationFrame(() => setTimeout(sample, 0))
  })
  await page.goto('/cs-CZ')
  const preview = page.getByTestId('prepend-preview')
  await expect(preview).toHaveAttribute('data-ready', 'true')
  // Include every frame of the old 150ms transition, not just its final position.
  await page.waitForTimeout(350)
  async function expectStable() {
    const offsets = await page.evaluate(() => window.prependOffsets.splice(0))
    expect(offsets.length).toBeGreaterThan(3)
    expect(Math.max(...offsets.map(Math.abs))).toBeLessThan(2)
  }
  await expectStable()
  for (const name of [/široký prepend/i, /úzký prepend/i, /skrýt prepend/i, /zobrazit prepend/i]) {
    await preview.getByRole('button', { name }).click()
    await page.waitForTimeout(350)
    await expectStable()
  }
})

test('empty label still animates horizontally on focus and blur', async ({ page }) => {
  await page.goto('/cs-CZ')
  const preview = page.getByTestId('prepend-preview')
  await expect(preview).toHaveAttribute('data-ready', 'true')
  const wrapper = preview.locator('.wrapper').first()
  const label = wrapper.locator('label')
  await expect.poll(() => label.evaluate(element => getComputedStyle(element).transitionDuration))
    .toBe('0.15s, 0.15s, 0.15s, 0.15s, 0.15s')

  for (const focus of [true, false]) {
    const positions = await wrapper.evaluate(async (element, shouldFocus) => {
      const input = element.querySelector('input')
      const label = element.querySelector('label')
      const body = element.querySelector('.input-wrapper__regular')
      const offset = () => label.getBoundingClientRect().left - body.getBoundingClientRect().left
      const positions = [offset()]
      if (shouldFocus) {
        input.focus()
      } else {
        input.blur()
      }
      const start = performance.now()
      while (performance.now() - start < 300) {
        await new Promise(resolve => requestAnimationFrame(resolve))
        positions.push(offset())
      }

      return positions
    }, focus)
    expect(positions[0]).toBeCloseTo(focus ? 64 : 0, 0)
    expect(positions.at(-1)).toBeCloseTo(focus ? 0 : 64, 0)
    expect(positions.some(position => position > 2 && position < 62)).toBe(true)
  }
})

test('non-stacked labels stay beside prepend until focused or filled', async ({ page }) => {
  await page.goto('/cs-CZ')
  const preview = page.getByTestId('prepend-preview')
  await expect(preview).toHaveAttribute('data-ready', 'true')
  const wrapper = preview.locator('.wrapper').first()
  const input = wrapper.locator('input')
  const label = wrapper.locator('label')
  const resize = preview.getByRole('button', { name: /prepend/i }).first()
  async function aligned(floating) {
    await expect.poll(async () => wrapper.evaluate((element, floated) => {
      const labelRect = element.querySelector('label').getBoundingClientRect()
      const target = element.querySelector(floated ? '.input-wrapper__regular' : '.input-wrapper__regular-input')

      return Math.abs(labelRect.left - target.getBoundingClientRect().left)
    }, floating)).toBeLessThan(2)
  }
  await aligned(false)
  const restingTop = (await label.boundingBox()).y
  await input.click()
  await expect(input).toBeFocused()
  await aligned(true)
  await expect.poll(async () => (await label.boundingBox()).y).toBeLessThan(restingTop - 8)
  await input.fill('123')
  await resize.click()
  await aligned(true)
  await input.fill('')
  await resize.click()
  await aligned(false)
  await resize.click()
  await aligned(false)
  await input.click()
  await aligned(true)
  await preview.getByRole('button', { name: /skrýt prepend/i }).click()
  await aligned(false)
  await preview.getByRole('button', { name: /zobrazit prepend/i }).click()
  await aligned(false)
  await page.reload()
  await expect(preview).toHaveAttribute('data-ready', 'true')
  await aligned(false)
})
