import { expect, test } from '@playwright/test'

for (const virtual of [false, true]) {
  test(`List mounts configured handles and cancels disposed drags (virtual=${virtual})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/vapor-list-drag?virtual=${virtual}`)
    await expect(page.getByTestId('list-drag')).toHaveAttribute('data-ready', 'true')
    await expect(page.getByTestId('drag-count')).toHaveText(virtual ? '1000' : '3')
    const row = label => page.locator('.list-row-item').filter({ has: page.getByRole('button', { name: label, exact: true }) })
    async function drag(label, target, custom = false) {
      const handle = row(label).locator(custom ? '.custom-handle' : '.list-move-handle')
      const from = await handle.boundingBox()
      const to = await row(target).boundingBox()
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
      await page.mouse.down()
      await page.mouse.move(to.x + to.width / 2, to.y + to.height - 2, { steps: 12 })
      await expect(page.locator('.ghost')).toHaveCount(1)
    }
    await drag('Alpha', 'Gamma')
    await page.mouse.up()
    await expect(page.getByTestId('drag-order')).toHaveText('Beta,Gamma,Alpha')
    await expect(page.getByTestId('drag-moves')).toHaveText('1')
    await page.getByRole('button', { name: 'Replace row roots' }).click()
    await expect(row('Beta')).toHaveJSProperty('tagName', 'SECTION')
    await page.getByRole('button', { name: 'Switch handle' }).click()
    await drag('Beta', 'Alpha', true)
    await page.mouse.up()
    await expect(page.getByTestId('drag-order')).toHaveText('Gamma,Alpha,Beta')
    await expect(page.getByTestId('drag-moves')).toHaveText('2')
    await drag('Gamma', 'Beta', true)
    await page.getByRole('button', { name: 'Switch handle' }).evaluate(element => element.click())
    await expect(page.locator('.ghost')).toHaveCount(0)
    await page.mouse.up()
    await expect(page.getByTestId('drag-moves')).toHaveText('2')
    // After remounting with the internal handle, the custom button must not start dragging.
    const oldHandle = await row('Gamma').locator('.custom-handle').boundingBox()
    await page.mouse.move(oldHandle.x + 5, oldHandle.y + 5)
    await page.mouse.down()
    await page.mouse.move(oldHandle.x + 80, oldHandle.y + 60, { steps: 8 })
    await page.mouse.up()
    await expect(page.locator('.ghost')).toHaveCount(0)
    await expect(page.getByTestId('drag-moves')).toHaveText('2')
    await page.getByRole('button', { name: 'Switch handle' }).click()
    await drag('Gamma', 'Beta', true)
    // Keep the pointer down while removing the active owner.
    await page.getByRole('button', { name: 'Toggle list' }).evaluate(element => element.click())
    await expect(page.locator('.ghost')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveClass(/select-none/)
    await page.mouse.up()
    await expect(page.getByTestId('drag-moves')).toHaveText('2')
    await expect(page.getByTestId('drag-order')).toHaveText('Gamma,Alpha,Beta')
    await page.getByRole('button', { name: 'Toggle list' }).click()
    await drag('Gamma', 'Beta', true)
    await page.mouse.up()
    await expect(page.getByTestId('drag-order')).toHaveText('Alpha,Beta,Gamma')
    await expect(page.getByTestId('drag-moves')).toHaveText('3')
    expect(errors).toEqual([])
  })
}

test('List drag handles render during SSR without creating ghosts', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-list-drag')
    expect(response.status()).toBe(200)
    await expect(page.getByTestId('list-drag')).toHaveAttribute('data-ready', 'false')
    await expect(page.locator('.ghost')).toHaveCount(0)
    await expect(page.getByTestId('drag-order')).toHaveText('Alpha,Beta,Gamma')
  } finally {
    await context.close()
  }
})

test('virtual drop indicator aligns with row boundaries before and after scrolling', async ({ page }) => {
  await page.goto('/vapor-list-drag?virtual=true')
  await expect(page.getByTestId('list-drag')).toHaveAttribute('data-ready', 'true')
  const scroller = page.locator('.list-content')
  // Keep both targets away from the auto-scroll edge zones while measuring alignment.
  for (const scrollTop of [0, 330]) {
    await scroller.evaluate((element, top) => element.scrollTop = top, scrollTop)
    await expect.poll(() => scroller.evaluate(element => element.scrollTop)).toBe(scrollTop)
    const source = scrollTop ? 'Item 12' : 'Alpha'
    const target = scrollTop ? 'Item 13' : 'Gamma'
    const row = label => page.locator('.list-row-item').filter({ has: page.getByRole('button', { name: label, exact: true }) })
    const from = await row(source).locator('.list-move-handle').boundingBox()
    const to = await row(target).boundingBox()
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    for (const above of [true, false]) {
      await page.mouse.move(to.x + to.width / 2, above ? to.y + 2 : to.y + to.height - 2, { steps: 12 })
      await expect(page.locator('.list-drop-indicator')).toBeVisible()
      await expect.poll(async () => {
        const indicator = await page.locator('.list-drop-indicator').boundingBox()
        const bounds = await row(target).locator('..').boundingBox()

        return Math.abs(indicator.y - (above ? bounds.y : bounds.y + bounds.height))
      }).toBeLessThanOrEqual(1)
      await expect.poll(async () => {
        const indicator = await page.locator('.list-drop-indicator').boundingBox()
        const arrow = await page.locator('.list-drop-indicator__arrow').boundingBox()
        const tipY = arrow.y + arrow.height * (above ? 9 : 15) / 24

        return Math.abs(tipY - (indicator.y + indicator.height / 2))
      }).toBeLessThanOrEqual(0.25)
    }
    // Cancel without changing the rows used by the next measurement.
    await page.getByRole('button', { name: 'Switch handle' }).evaluate(element => element.click())
    await page.mouse.up()
    await page.getByRole('button', { name: 'Switch handle' }).click()
  }
})

for (const cancel of [false, true]) {
  test(`active drag survives recycling its source row (cancel=${cancel})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/vapor-list-drag?virtual=true')
    await expect(page.getByTestId('list-drag')).toHaveAttribute('data-ready', 'true')
    const scroller = page.locator('.list-content')
    const source = scroller.locator('.list-row-item[data-id="0"]')
    const handle = await source.locator('.list-move-handle').boundingBox()
    await page.mouse.move(handle.x + 10, handle.y + 10)
    await page.mouse.down()
    await page.mouse.move(handle.x + 90, handle.y + 45, { steps: 12 })
    await expect(page.locator('.ghost')).toHaveCount(1)
    await scroller.evaluate(element => element.scrollTop = 6000)
    await expect(source).toHaveCount(0)
    await expect(page.locator('.ghost')).toHaveCount(1)
    const viewport = await scroller.boundingBox()
    await page.mouse.move(viewport.x + 120, viewport.y + 90, { steps: 12 })
    await expect(page.locator('.list-drop-indicator')).toBeVisible()
    if (cancel) {
      await page.getByRole('button', { name: 'Toggle list' }).evaluate(element => element.click())
      await expect(page.locator('.ghost')).toHaveCount(0)
      await page.mouse.up()
      await expect(page.getByTestId('drag-moves')).toHaveText('0')
      await expect(page.getByTestId('drag-order')).toHaveText('Alpha,Beta,Gamma')
    } else {
      await page.mouse.up()
      await expect(page.getByTestId('drag-moves')).toHaveText('1')
      await expect(source).toBeVisible()
      await expect.poll(async () => Number(await source.locator('..').getAttribute('data-idx'))).toBeGreaterThan(100)
      await expect(page.getByTestId('drag-order')).toHaveText('Beta,Gamma,Item 4')
    }
    await expect(page.locator('.ghost')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveClass(/select-none/)
    expect(errors).toEqual([])
  })
}

test('drag permission is checked on each attempt without remounting the handle', async ({ page }) => {
  await page.goto('/vapor-list-drag')
  await expect(page.getByTestId('list-drag')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Switch handle' }).click()
  const handle = page.locator('.list-content .custom-handle').first()
  const original = await handle.elementHandle()
  await page.getByRole('button', { name: 'Toggle drag permission' }).click()
  for (const allowed of [false, true]) {
    const from = await handle.boundingBox()
    const to = await page.locator('.list-content .list-row-item').last().boundingBox()
    await page.mouse.move(from.x + 5, from.y + 5)
    await page.mouse.down()
    await page.mouse.move(to.x + 100, to.y + to.height - 2, { steps: 12 })
    await expect(page.locator('.ghost')).toHaveCount(allowed ? 1 : 0)
    await page.mouse.up()
    await expect(page.getByTestId('drag-moves')).toHaveText(allowed ? '1' : '0')
    if (!allowed) {
      await page.getByRole('button', { name: 'Toggle drag permission' }).click()
      expect(await original.evaluate(element => element.isConnected)).toBe(true)
    }
  }
  await expect(page.getByTestId('drag-order')).toHaveText('Beta,Gamma,Alpha')
})
