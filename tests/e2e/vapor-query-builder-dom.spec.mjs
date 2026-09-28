import { expect, test } from '@playwright/test'

test('QueryBuilder moves a condition and cancels an unmounted drag without changing order', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-query-builder-dom?small=true')
  await expect(page.getByTestId('query-builder-dom')).toHaveAttribute('data-ready', 'true')
  const rows = page.locator('[data-testid="query-builder-dom"] .qb-item')
  async function startDrag() {
    await rows.last().scrollIntoViewIfNeeded()
    const source = await rows.first().locator('.query-builder-move-handler').boundingBox()
    const target = await rows.last().boundingBox()
    await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
    await page.mouse.down()
    await page.mouse.move(target.x + target.width / 2, target.y + target.height - 4, { steps: 12 })
    await expect(page.locator('body > .qb-item')).toHaveCount(1)
    await expect(page.locator('[data-query-builder-drop-indicator]')).toBeVisible()
    await expect.poll(async () => {
      const indicator = await page.locator('[data-query-builder-drop-indicator]').boundingBox()
      const lastRow = await rows.last().boundingBox()
      const visibleBottom = await page.getByTestId('query-builder-dom').locator('.query-builder').last().evaluate(element => {
        const bounds = element.getBoundingClientRect()

        return Math.min(bounds.top + element.clientHeight - 2, window.innerHeight - 12)
      })

      return Math.abs(indicator.y - Math.min(lastRow.y + lastRow.height, visibleBottom))
    }).toBeLessThan(3)
  }
  await startDrag()
  await page.mouse.up()
  await expect(page.getByTestId('query-order')).toHaveText('Beta,Gamma,Alpha')
  await expect(page.locator('body > .qb-item')).toHaveCount(0)
  await startDrag()
  await page.getByRole('button', { name: 'Toggle query builder' }).evaluate(element => element.click())
  await expect(page.locator('body > .qb-item')).toHaveCount(0)
  await page.mouse.move(400, 300)
  await page.mouse.up()
  await expect(page.getByTestId('query-order')).toHaveText('Beta,Gamma,Alpha')
  await page.getByRole('button', { name: 'Toggle query builder' }).click()
  await startDrag()
  await page.mouse.up()
  await expect(page.getByTestId('query-order')).toHaveText('Gamma,Alpha,Beta')
  expect(errors).toEqual([])
})

test('QueryBuilder server HTML contains conditions without a drag clone', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-query-builder-dom?small=true')
    expect(response.status()).toBe(200)
    await expect(page.locator('.qb-item')).toHaveCount(3)
    await expect(page.getByTestId('query-order')).toHaveText('Alpha,Beta,Gamma')
    await expect(page.locator('body > .qb-item')).toHaveCount(0)
  } finally {
    await context.close()
  }
})

test('inline first condition opens its editor and touch cancellation clears a drag', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-query-builder-dom?small=true')
  await expect(page.getByTestId('query-builder-dom')).toHaveAttribute('data-ready', 'true')
  await page.getByTestId('inline-builder').getByRole('button').last().click()
  await expect(page.getByTestId('inline-builder').locator('.qb-item')).toHaveCount(1)
  await expect(page.locator('.menu:visible')).toHaveCount(1)
  await page.getByRole('button', { name: 'Toggle inline builder' }).evaluate(element => element.click())
  await expect(page.locator('.menu:visible')).toHaveCount(0)

  const handle = page.locator('.query-builder-move-handler').first()
  await handle.evaluate(element => {
    const rect = element.getBoundingClientRect()
    element.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: 'touch',
      clientX: rect.x + 5,
      clientY: rect.y + 5,
    }))
  })
  await expect(page.locator('body > .qb-item')).toHaveCount(1)
  await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, pointerType: 'touch' })))
  await expect(page.locator('body > .qb-item')).toHaveCount(0)
  await expect(page.getByTestId('query-order')).toHaveText('Alpha,Beta,Gamma')
  expect(errors).toEqual([])
})

test('QueryBuilder commits the last target when released before the next frame', async ({ page }) => {
  await page.goto('/vapor-query-builder-dom?small=true')
  await expect(page.getByTestId('query-builder-dom')).toHaveAttribute('data-ready', 'true')
  await page.getByTestId('query-builder-dom').locator('.qb-item').last().scrollIntoViewIfNeeded()
  await page.getByTestId('query-builder-dom').evaluate(root => {
    const rows = root.querySelectorAll('.qb-item')
    const handle = rows[0].querySelector('.query-builder-move-handler')
    const source = handle.getBoundingClientRect()
    const target = rows[rows.length - 1].getBoundingClientRect()
    handle.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true, cancelable: true, clientX: source.x + 5, clientY: source.y + 5 }))
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: target.x + target.width / 2, clientY: target.bottom - 4 }))
    window.dispatchEvent(new PointerEvent('pointerup', {
      pointerId: 1,
      clientX: target.x + target.width / 2,
      clientY: target.bottom - 4,
    }))
  })
  await expect(page.getByTestId('query-order')).toHaveText('Beta,Gamma,Alpha')
  await expect(page.locator('body > .qb-item')).toHaveCount(0)
})

test('QueryBuilder autoscrolls both axes through Dragdoll and stops on cancellation', async ({ page }) => {
  await page.goto('/vapor-query-builder-dom?small=true')
  await expect(page.getByTestId('query-builder-dom')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Toggle scroll viewport' }).click()
  const scroller = page.locator('.scroll-preview .query-builder')
  await scroller.evaluate(el => {
    window.queryScrollCalls = 0
    const scrollTo = el.scrollTo
    el.scrollTo = function (...args) {
      window.queryScrollCalls++

      return scrollTo.apply(this, args)
    }
  })
  const source = await scroller.locator('.query-builder-move-handler').first().boundingBox()
  const bounds = await scroller.boundingBox()
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
  await page.mouse.down()
  for (const inset of [16, 13, 10]) {
    await page.mouse.move(bounds.x + bounds.width - inset, bounds.y + bounds.height - inset, { steps: 3 })
  }
  await expect.poll(() => scroller.evaluate(el => el.scrollTop)).toBeGreaterThan(20)
  await expect.poll(() => scroller.evaluate(el => el.scrollLeft)).toBeGreaterThan(20)
  await expect.poll(() => page.evaluate(() => window.queryScrollCalls)).toBeGreaterThan(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('body > .qb-row')).toHaveCount(0)
  const stoppedCalls = await page.evaluate(() => window.queryScrollCalls)
  expect(stoppedCalls).toBeGreaterThan(0)
  // Observe actual plugin writes, not compositor offsets that can lag behind cancellation.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  expect(await page.evaluate(() => window.queryScrollCalls)).toBe(stoppedCalls)
  await page.mouse.up()
  await expect(page.getByTestId('query-order')).toHaveText('Alpha,Beta,Gamma')
})

test('root drop indicator is not clipped by the QueryBuilder scroll viewport', async ({ page }) => {
  await page.goto('/vapor-query-builder-dom?small=true')
  await expect(page.getByTestId('query-builder-dom')).toHaveAttribute('data-ready', 'true')
  const builder = page.locator('.query-builder').last()
  // Over the root header the drop goes above the first condition, so drag another one
  const handle = await builder.locator('.qb-item .query-builder-move-handler').last().boundingBox()
  const root = await builder.locator('.qb-group').first().boundingBox()
  await page.mouse.move(handle.x + 5, handle.y + 5)
  await page.mouse.down()
  await page.mouse.move(root.x + 10, root.y + 15, { steps: 8 })
  const icon = page.locator('.drop-indicator__icon')
  await expect(icon).toBeVisible()
  const visibleWidth = await icon.evaluate(el => {
    const rect = el.getBoundingClientRect()
    let left = Math.max(0, rect.left)
    let right = Math.min(window.innerWidth, rect.right)
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowX)) {
        const bounds = parent.getBoundingClientRect()
        left = Math.max(left, bounds.left)
        right = Math.min(right, bounds.right)
      }
    }

    return Math.max(0, right - left)
  })
  expect(visibleWidth).toBeGreaterThanOrEqual((await icon.boundingBox()).width - 1)
  await page.keyboard.press('Escape')
  await expect(icon).toHaveCount(0)
  await page.mouse.up()
})
