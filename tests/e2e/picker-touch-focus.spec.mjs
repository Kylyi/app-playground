import { expect, test } from '@playwright/test'

const pickers = [
  { name: 'date', path: 'vapor-date-time-inputs', ready: 'date-time-example', field: 'date-field', accessory: '.picker-icon' },
  { name: 'time', path: 'vapor-date-time-inputs', ready: 'date-time-example', field: 'time-field', accessory: '.time-input-icon' },
  { name: 'color', path: 'vapor-color-inputs', ready: 'color-inputs-example', field: 'color-input-field', accessory: '[data-cy="color-picker-preview"]' },
]

for (const width of [390, 1100]) {
  for (const picker of pickers) {
    test(`${picker.name} separates touch activation from editable focus (${width}px)`, async ({ browser, browserName, baseURL }) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: 844 },
        hasTouch: true,
        ...(browserName !== 'firefox' && { isMobile: width === 390 }),
      })
      try {
        const page = await context.newPage()
        const problems = []
        page.on('pageerror', error => problems.push(error.message))
        await page.goto(`/cs-CZ/${picker.path}`)
        await expect(page.getByTestId(picker.ready)).toHaveAttribute('data-ready', 'true')
        const field = page.getByTestId(picker.field)
        const input = field.locator('input').first()
        const floating = page.locator(width === 390 ? '.dialog__wrapper' : '.menu')
        await input.evaluate(el => {
          el.dataset.focusCount = '0'
          el.addEventListener('focus', () => {
            el.dataset.focusCount = String(Number(el.dataset.focusCount) + 1)
          })
        })

        for (const trigger of [input, field.locator('label'), field.locator(picker.accessory)]) {
          await trigger.tap()
          await expect(floating).toBeVisible()
          await expect(input).not.toBeFocused()
          await expect(input).toHaveAttribute('data-focus-count', '0')
          await page.keyboard.press('Escape')
          await expect(floating).toHaveCount(0)
        }

        if (picker.name === 'time') {
          await input.tap()
          await expect(floating).toBeVisible()
          const hours = floating.locator('input').first()
          const minutes = floating.locator('input').last()
          await hours.tap()
          await expect(hours).toBeFocused()
          await hours.fill('10')
          await minutes.tap()
          await expect(minutes).toBeFocused()
          await minutes.fill('45')
          await expect(page.getByTestId('time-value')).toHaveText('10:45')
          await expect(input).toHaveAttribute('data-focus-count', '0')
          await page.keyboard.press('Escape')
          await expect(floating).toHaveCount(0)
        }

        if (picker.name !== 'time') {
          await input.tap()
          await expect(floating).toBeVisible()
          const choice = picker.name === 'date'
            ? floating.locator('.dp-day').filter({ has: page.locator('.dayNo').getByText('16', { exact: true }) })
            : floating.locator('[data-color="white"]')
          await choice.tap()
          await expect(floating).toHaveCount(0)
          await expect(input).toHaveAttribute('data-focus-count', '0')
        }

        await field.locator('button').first().tap()
        await expect(input).toHaveAttribute('data-focus-count', '0')
        await expect(floating).toHaveCount(0)

        // A previous touch must not make subsequent keyboard focus blur.
        // Use an adjacent native control so Dialog's focus restoration does
        // not determine where this keyboard navigation starts.
        await input.evaluate(el => {
          const start = document.createElement('button')
          start.dataset.testid = 'keyboard-start'
          start.textContent = 'Keyboard start'
          el.before(start)
          start.focus()
        })
        await expect(page.getByTestId('keyboard-start')).toBeFocused()
        await page.keyboard.press('Tab')
        await expect(input).toBeFocused()
        await expect(input).toHaveAttribute('data-focus-count', '1')
        await page.getByTestId('keyboard-start').evaluate(el => el.remove())
        await expect(floating).toBeVisible()
        await page.keyboard.press('Escape')
        await input.evaluate(el => el.blur())
        await input.click()
        await expect(input).toBeFocused()

        if (width === 1100) {
          // Touch clear must not restore an input previously focused by mouse.
          const value = { date: '15.06.2026', time: '14:30', color: '#ff0000' }[picker.name]
          await input.fill(value)
          const focusCount = await input.getAttribute('data-focus-count')
          await field.locator('button').first().tap()
          await expect(input).toHaveAttribute('data-focus-count', focusCount)
          await expect(page.getByTestId(picker.name === 'color' ? 'color-input-value' : `${picker.name}-value`)).toHaveText('empty')
          await expect(input).toHaveAttribute('data-focus-count', focusCount)
        }
        await page.keyboard.press('Escape')

        await page.getByRole('button', { name: 'Toggle readonly', exact: true }).tap()
        await input.tap()
        await expect(input).not.toBeFocused()
        await expect(floating).toHaveCount(0)
        expect(problems).toEqual([])
      } finally {
        await context.close()
      }
    })
  }
}

test('scrolling from a picker input does not open it', async ({ browser, browserName, baseURL }) => {
  test.skip(browserName !== 'chromium', 'Native touch movement uses Chromium CDP')
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-date-time-inputs')
    await expect(page.getByTestId('date-time-example')).toHaveAttribute('data-ready', 'true')
    await page.evaluate(() => document.body.style.minHeight = '2000px')
    const input = page.getByTestId('date-field').locator('input')
    const bounds = await input.boundingBox()
    const session = await context.newCDPSession(page)
    const x = bounds.x + bounds.width / 2
    const y = bounds.y + bounds.height / 2
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (const distance of [30, 60, 90, 120]) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - distance }] })
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    await expect(input).not.toBeFocused()
    await expect(page.locator('.dialog__wrapper, .menu')).toHaveCount(0)
    await input.tap()
    await expect(page.locator('.dialog__wrapper')).toBeVisible()
  } finally {
    await context.close()
  }
})
