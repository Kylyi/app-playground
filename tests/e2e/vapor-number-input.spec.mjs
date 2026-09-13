import { expect, test } from '@playwright/test'

test('NumberInput preserves masking, step controls, scoped slots and public methods', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-number-input')
  await expect(page.getByTestId('number-input-example')).toHaveAttribute('data-ready', 'true')
  const field = page.getByTestId('number-input-field')
  const input = field.locator('input')
  await expect(input).toHaveValue('12,5')
  await field.locator('.number-input__step button').first().click()
  await expect(page.getByTestId('number-input-value')).toHaveText('13')
  await field.locator('.number-input__step button').last().click()
  await expect(page.getByTestId('number-input-value')).toHaveText('12.5')
  await input.fill('25,75')
  await expect(page.getByTestId('number-input-value')).toHaveText('25.75')
  await input.evaluate(el => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text', '42,25')
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
  })
  await expect(input).toHaveValue('42,25')
  await expect(page.getByTestId('number-input-value')).toHaveText('42.25')
  await page.getByRole('button', { name: 'Select input', exact: true }).click()
  expect(await input.evaluate(el => [el.selectionStart, el.selectionEnd])).toEqual([0, 5])
  await page.getByRole('button', { name: 'Blur input', exact: true }).click()
  await expect(input).not.toBeFocused()
  await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
  await expect(field).toContainText('Custom Number')
  await expect(field).toContainText('Custom number hint')
  await field.getByRole('button', { name: 'Slot focus', exact: true }).click()
  await expect(input).toBeFocused()
  await field.getByRole('button', { name: 'Slot clear', exact: true }).click()
  await expect(input).toHaveValue('')
  await expect(page.getByTestId('number-input-value')).toHaveText('empty')
  await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
  await expect(field).not.toContainText('Custom')
  await expect(field).toContainText('Number')
  await page.getByRole('button', { name: 'Replace model', exact: true }).click()
  await expect(input).toHaveValue('7,5')
  await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
  await expect(input).toHaveAttribute('readonly', '')
  await expect(field.getByRole('button')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(input).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await page.getByRole('button', { name: 'Focus input', exact: true }).click()
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('7,5')
  expect(problems).toEqual([])
})

test('NumberInput renders localized numeric value and navigation during SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-number-input')
    const field = page.getByTestId('number-input-field')
    await expect(field.locator('input')).toHaveValue('12,5')
    await expect(field.locator('input')).toHaveAttribute('placeholder', 'Number value')
    await expect(field).toContainText('Number')
    await expect(page.getByRole('link', { name: 'NumberInput · maska a krokování', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-number-input')
  } finally {
    await context.close()
  }
})

test('NumberInputStep repeats while held and releases listeners when cancelled or unmounted', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  await page.goto('/cs-CZ/vapor-number-input')
  await expect(page.getByTestId('number-input-example')).toHaveAttribute('data-ready', 'true')
  await page.clock.install()
  // Track actual global subscriptions so a stopped timer cannot hide leaked listeners.
  await page.evaluate(() => {
    const add = window.addEventListener.bind(window)
    const remove = window.removeEventListener.bind(window)
    const subscriptions = new Map()
    const cancellationListeners = new Set()
    const releaseEvents = new Set(['pointerup', 'pointercancel', 'mouseup', 'touchend', 'touchmove', 'touchcancel'])
    window.addEventListener = (type, listener, options) => {
      if (type === 'pointercancel') {
        cancellationListeners.add(listener)
      }
      if (releaseEvents.has(type)) {
        const listeners = subscriptions.get(type) ?? new Set()
        listeners.add(listener)
        subscriptions.set(type, listeners)
      }
      add(type, listener, options)
    }
    window.removeEventListener = (type, listener, options) => {
      subscriptions.get(type)?.delete(listener)
      remove(type, listener, options)
    }
    window.stepSubscriptionCount = () => [...subscriptions.values()]
      .reduce((total, listeners) => total + [...listeners]
        .filter(listener => cancellationListeners.has(listener))
        .length, 0)
  })
  const value = page.getByTestId('number-input-value')
  const buttons = page.getByTestId('number-input-field').locator('.number-input__step button')
  await buttons.first().dispatchEvent('pointerdown', { button: 0 })
  await expect(value).toHaveText('13')
  await page.clock.runFor(360)
  await expect(value).toHaveText('14.5')
  await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel')))
  await page.clock.runFor(600)
  await expect(value).toHaveText('14.5')
  expect(await page.evaluate(() => window.stepSubscriptionCount())).toBe(0)

  await buttons.last().dispatchEvent('pointerdown', { button: 0, pointerType: 'touch' })
  await expect(value).toHaveText('14')
  await page.clock.runFor(240)
  await expect(value).toHaveText('13')
  await page.evaluate(() => window.dispatchEvent(new Event('touchcancel')))
  await page.clock.runFor(600)
  await expect(value).toHaveText('13')
  expect(await page.evaluate(() => window.stepSubscriptionCount())).toBe(0)

  await buttons.first().dispatchEvent('pointerdown', { button: 0 })
  await expect(value).toHaveText('13.5')
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).dispatchEvent('click')
  await expect(buttons).toHaveCount(0)
  await page.clock.runFor(600)
  await expect(value).toHaveText('13.5')
  expect(await page.evaluate(() => window.stepSubscriptionCount())).toBe(0)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await buttons.last().dispatchEvent('pointerdown', { button: 0 })
  await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup')))
  await page.clock.runFor(600)
  await expect(value).toHaveText('13')
  expect(await page.evaluate(() => window.stepSubscriptionCount())).toBe(0)
  expect(problems).toEqual([])
})
