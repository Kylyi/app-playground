import { expect, test } from '@playwright/test'

test('Table and Pivot follow replaced configuration objects', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  await page.goto('/cs-CZ/vapor-table-pivot-dom?controls=true&updates=true')
  await expect(page.locator('.pivot-loading')).toHaveCount(0)
  const pagination = page.getByTestId('table').locator('.table-pagination')
  for (let index = 0; index < 3; index++) {
    await expect(page.locator('.pivot-content')).toHaveCSS('background-color', 'rgb(250, 230, 210)')
    await pagination.locator('button').last().click()
    await expect(pagination.locator('.is-active')).toHaveText('10')
    await page.getByRole('button', { name: 'Replace configurations' }).click()
    await expect(page.locator('.pivot-content')).toHaveCSS('background-color', 'rgb(210, 230, 250)')
    await expect(pagination.getByRole('button', { name: '4', exact: true })).toBeVisible()
    // The previous last page is clamped to the new last page.
    await expect(pagination.locator('.is-active')).toHaveText('4')
    await page.getByRole('button', { name: 'Replace configurations' }).click()
  }
  await expect(page.getByRole('link', { name: 'Table a Pivot · změny konfigurace', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vapor-table-pivot-dom?controls=true&updates=true')
  expect(problems).toEqual([])
})

for (const emitKey of [false, true]) {
  test(`Table header selection callback follows select, clear and partial selection (emitKey=${emitKey})`, async ({ page }) => {
    await page.goto(`/cs-CZ/vapor-table-pivot-dom?updates=true&emitKey=${emitKey}`)
    const table = page.getByTestId('table')
    const header = table.locator('.th[data-column="_selectable"] .checkbox')
    const calls = () => page.getByTestId('select-all-calls').evaluate(el => JSON.parse(el.textContent))
    await header.click()
    await expect.poll(async () => (await calls()).length).toBe(1)
    const first = (await calls())[0]
    expect(first).toHaveLength(100)
    expect(first[0]).toEqual(emitKey ? 0 : { id: 0, name: 'Item 0', group: 'Group 0', value: 1 })
    await header.click()
    expect((await calls())[1]).toEqual([])
    await table.locator('.tr .checkbox').first().click()
    await header.click()
    await expect.poll(async () => (await calls()).length).toBe(3)
    expect((await calls())[2]).toEqual(first)
  })
}

test('Table and Pivot synchronize native scrollers and resize columns after hydration and remount', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-table-pivot-dom')
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
  for (const remount of [false, true]) {
    if (remount) {
      await page.getByRole('button', { name: 'Toggle tables' }).click()
      await page.getByRole('button', { name: 'Toggle tables' }).click()
    }
    const tableBody = page.locator('[data-testid="table"] .virtual-scroll')
    await tableBody.evaluate(el => el.scrollLeft = 150)
    await expect.poll(() => page.locator('.table-header .content').evaluate(el => el.scrollLeft)).toBe(150)
    const values = page.locator('.pivot-content__values')
    const rows = page.locator('.pivot-content__rows')
    await values.evaluate(el => el.scrollTop = 300)
    await expect.poll(() => rows.evaluate(el => el.scrollTop)).toBe(300)
    await values.evaluate(el => el.scrollLeft = 150)
    await expect.poll(() => page.locator('.pivot-value-header').evaluate(el => el.scrollLeft)).toBe(150)
    for (const root of ['[data-testid="table"]', '.pivot']) {
      const splitter = page.locator(`${root} .splitter:not(.splitter--active)`).first()
      await splitter.scrollIntoViewIfNeeded()
      const box = await splitter.boundingBox()
      const oldLeft = await splitter.evaluate(el => Number.parseFloat(el.style.left))
      await page.mouse.move(box.x + box.width / 2, box.y + 8)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 + 60, box.y + 8, { steps: 8 })
      // Table teleports its fixed guide to the body; only one resize runs at a time
      await expect(page.locator('.splitter--active')).toBeVisible()
      await page.mouse.up()
      await expect.poll(() => splitter.evaluate(el => Number.parseFloat(el.style.left))).toBeGreaterThan(oldLeft + 40)
    }
    await page.getByRole('button', { name: 'Justify' }).click()
    const widths = await page.locator('[data-testid="table"] .th').evaluateAll(es => es.map(el => el.getBoundingClientRect().width))
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(2)
  }
  expect(errors).toEqual([])
})

test('Table and Pivot render with SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    expect((await page.goto('/cs-CZ/vapor-table-pivot-dom')).status()).toBe(200)
    await expect(page.getByTestId('table')).toBeVisible()
    await expect(page.locator('[data-testid="table"] input[name="_search"]')).toBeVisible()
    await expect(page.locator('[data-testid="table"] .table-top__export')).toBeVisible()
    await expect(page.locator('[data-testid="table"] .table-toolbar')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Table · migrované ovládání', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-table-pivot-dom?controls=true&feature=filterChips')
    await expect(page.getByRole('link', { name: 'Table · prázdný stav', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-table-pivot-dom?controls=true&empty=true&feature=filterChips')
    await expect(page.locator('.table-totals')).toContainText('Total')
    await expect(page.locator('.pivot')).toBeVisible()
    await expect(page.locator('.pivot-top')).toBeVisible()
    await expect(page.locator('.pivot-loading.is-initial')).toBeVisible()
  } finally {
    await context.close()
  }
})

test('Table top controls remain interactive across renderer boundaries', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/cs-CZ/vapor-table-pivot-dom')
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
  // Removing filters is only offered while a column or query filter exists
  await expect(page.getByTestId('table').locator('.table-top__remove-filters')).toHaveCount(0)
  await page.goto('/cs-CZ/vapor-table-pivot-dom?controls=true')
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')

  const table = page.getByTestId('table')
  const search = table.locator('input[name="_search"]')
  await search.fill('Item 4')
  await expect(search).toHaveValue('Item 4')

  await table.locator('.table-toolbar button').click()
  await table.locator('.table-top__export').click()
  await expect(page.locator('.menu').last()).toBeVisible()
  await page.keyboard.press('Escape')

  await table.locator('.table-top__remove-filters').click()
  await expect(page.locator('[data-cy="remove-all-filters"]')).toBeVisible()
  await page.keyboard.press('Escape')

  expect(errors).toEqual([])
})

for (const feature of ['filterChips', 'queryBuilderDialog']) {
  test(`Table migrated ${feature} control remains interactive`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/cs-CZ/vapor-table-pivot-dom?controls=true&feature=${feature}`)

    const table = page.getByTestId('table')
    await expect(table.locator('.table-pagination')).toBeVisible()
    await expect(table.locator('.table-pagination .is-active')).toHaveText('1')
    await table.locator('.table-pagination button').last().click()
    await expect(table.locator('.table-pagination .is-active')).toHaveText('10')

    if (feature === 'filterChips') {
      await expect(table.locator('.table-filter-chip')).toContainText('Item 4')
    } else {
      await table.locator('.table-top__left button').first().click()
      await expect(page.locator('.dialog').last()).toBeVisible()
      await page.keyboard.press('Escape')
    }

    expect(errors).toEqual([])
  })
}

test('Table empty state renders through the native wrapper', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/cs-CZ/vapor-table-pivot-dom?controls=true&feature=filterChips&empty=true')

  await expect(page.getByTestId('table').locator('.table-empty')).toContainText('Žádná data')
  expect(errors).toEqual([])
})

test('Pivot hydration retains a single content subtree', async ({ page }) => {
  await page.goto('/vapor-table-pivot-dom')
  await expect(page.locator('.pivot-content__values .content-row').first()).toBeVisible()
  await expect(page.locator('.pivot-content')).toHaveCount(1)
  await expect(page.locator('.pivot-loading')).toHaveCount(0)
})

test('Pivot rows and value cells preserve click and keyboard events', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  await page.goto('/cs-CZ/vapor-table-pivot-dom')
  await expect(page.locator('.pivot-loading')).toHaveCount(0)
  await expect(page.locator('.table-totals')).toContainText('Total')

  const cell = page.locator('.pivot-value-item-cell').first()
  await cell.click()
  await expect(page.getByTestId('pivot-clicks')).toHaveText('0:1')
  await cell.press('Space')
  await expect(page.getByTestId('pivot-clicks')).toHaveText('0:2')

  const row = page.locator('.pivot-row-item').first()
  await row.press('Enter')
  await expect(page.getByTestId('pivot-clicks')).toHaveText('1:2')
  expect(problems).toEqual([])
})

test('resize cancellation and unmount release document listeners without committing widths', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-table-pivot-dom')
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
  for (const root of ['[data-testid="table"]', '.pivot']) {
    for (const unmount of [false, true]) {
      // Separate drag attempts from Table's 500 ms double-click autofit window.
      await page.waitForTimeout(550)
      const splitter = page.locator(`${root} .splitter:not(.splitter--active)`).first()
      await splitter.scrollIntoViewIfNeeded()
      const before = await splitter.evaluate(el => Number.parseFloat(el.style.left))
      const box = await splitter.boundingBox()
      await page.mouse.move(box.x + box.width / 2, box.y + 8)
      await page.mouse.down()
      await page.mouse.move(box.x + 65, box.y + 8, { steps: 8 })
      // Table teleports its fixed guide to the body; only one resize runs at a time
      await expect(page.locator('.splitter--active')).toBeVisible()
      if (unmount) {
        await page.getByRole('button', { name: 'Toggle tables' }).evaluate(el => el.click())
      } else {
        await page.locator('html').dispatchEvent('pointercancel')
      }
      await expect(page.locator('.splitter--active')).toHaveCount(0)
      expect(await page.locator('html').evaluate(el => [el.style.cursor, el.style.userSelect])).toEqual(['', ''])
      await page.mouse.move(box.x + 100, box.y + 8)
      await page.mouse.up()
      if (unmount) {
        await page.getByRole('button', { name: 'Toggle tables' }).click()
      }
      await expect.poll(() => splitter.evaluate(el => Number.parseFloat(el.style.left))).toBe(before)
    }
  }
  expect(errors).toEqual([])
})

test('initial Pivot performance warning remains actionable', async ({ page }) => {
  await page.goto('/vapor-table-pivot-dom?warning=true')
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
  const warning = page.locator('.pivot-performance-warning')
  await expect(warning).toBeVisible()
  await warning.getByRole('button', { name: 'Run anyway' }).click()
  await expect(warning).toHaveCount(0)
  await expect(page.locator('.pivot-content')).toHaveCount(1)
  await expect(page.locator('.pivot-content__values .content-row').first()).toBeVisible()
})

test('Vapor wrapper removal disposes nested Table resize', async ({ page }) => {
  await page.goto('/vapor-table-pivot-dom?wrapper=true')
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
  // Exercise both hydrated children and a fresh client mount.
  for (let attempt = 0; attempt < 2; attempt++) {
    const splitter = page.locator('[data-testid="table"] .splitter:not(.splitter--active)').first()
    await splitter.scrollIntoViewIfNeeded()
    const box = await splitter.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + 8)
    await page.mouse.down()
    await page.mouse.move(box.x + 65, box.y + 8, { steps: 8 })
    await expect(page.locator('.splitter--active')).toBeVisible()
    await page.getByRole('button', { name: 'Toggle tables' }).evaluate(el => el.click())
    await expect(page.locator('.splitter--active')).toHaveCount(0)
    expect(await page.locator('html').evaluate(el => el.style.cursor)).toBe('')
    expect(await page.locator('html').evaluate(el => el.style.userSelect)).toBe('')
    await page.mouse.up()
    await page.getByRole('button', { name: 'Toggle tables' }).click()
  }
})

for (const mode of ['true', 'immediate']) {
  test(`Pivot shows its initial loading overlay until rows are ready (${mode})`, async ({ page }) => {
    await page.goto(`/vapor-table-pivot-dom?loading=${mode}`)
    await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
    if (mode === 'immediate') {
      await page.getByRole('button', { name: 'Toggle tables' }).click()
      await page.getByRole('button', { name: 'Toggle tables' }).click()
    }
    const loading = page.locator('.pivot-loading.is-initial')
    await expect(loading).toBeVisible()
    await expect(page.locator('.pivot-empty')).toHaveCount(0)
    await expect(loading).toHaveCount(0)
    await expect(page.locator('.pivot-content')).toHaveCount(1)
    await expect(page.locator('.pivot-content__values .content-row').first()).toBeVisible()
  })
}

test('Pivot header borders align and row headers follow resized columns', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-table-pivot-dom')
  await expect(page.locator('.pivot-loading')).toHaveCount(0)
  const header = page.locator('.pivot-row-header-cell').first()
  const valueHeader = page.locator('.pivot-value-header-cell').first()
  const body = page.locator('.pivot-content__rows .pivot-row-item-cell').first()
  const rowHeader = page.locator('.pivot-row-header')
  await expect.poll(async () => {
    const left = await rowHeader.boundingBox()
    const right = await valueHeader.boundingBox()

    return Math.abs(left.y + left.height - right.y - right.height)
  }).toBeLessThan(1)
  const splitter = page.locator('.pivot .splitter:not(.splitter--active)').first()
  await splitter.scrollIntoViewIfNeeded()
  const startWidth = (await header.boundingBox()).width
  const box = await splitter.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + 8)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + 8, { steps: 8 })
  await page.mouse.up()
  await expect.poll(async () => (await header.boundingBox()).width).toBeGreaterThan(startWidth + 60)
  await expect.poll(async () => Math.abs((await header.boundingBox()).width - (await body.boundingBox()).width)).toBeLessThan(1)
})

test('grouped Pivot pins the context of the rows scrolling underneath', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  await page.goto('/cs-CZ/vapor-table-pivot-dom?grouped=true')
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
  const rows = page.locator('.pivot-content__rows')
  const values = page.locator('.pivot-content__values')
  const stuck = rows.locator('.virtual-scroll__row.is-stuck')
  await expect(rows.locator('.content-row').first()).toContainText('Group 0')
  await expect(rows.locator('.pivot-row-context')).toHaveCount(0)

  // Collapsed groups have no context to pin; Group 0 (13 items) is expanded
  await rows.locator('.content-row').first().locator('.pivot-collapse-btn').click()
  await expect(rows.locator('.content-row').filter({ hasText: /^Item \d+$/ }).first()).toBeVisible()

  await rows.evaluate(element => element.scrollTop = 200)
  await expect(stuck).toHaveCount(1)
  await expect(stuck.locator('.pivot-row-context')).toContainText('Group 0')
  await expect(stuck.locator('.pivot-row-context')).not.toContainText('Item')
  await expect.poll(() => values.evaluate(element => element.scrollTop)).toBe(200)
  // The value side of the pinned row stays blank
  await expect(values.locator('.virtual-scroll__row.is-stuck')).toHaveCount(1)
  await expect(values.locator('.virtual-scroll__row.is-stuck .pivot-value-item-cell')).toHaveCount(0)

  // Past Group 0 only collapsed groups are visible, so the pinned row has no labels to show
  await rows.evaluate(element => element.scrollTop = element.scrollHeight)
  await expect(stuck.locator('.pivot-row-context')).toHaveClass(/invisible/)
  await expect(stuck.locator('.pivot-row-context')).toBeHidden()
  await rows.evaluate(element => element.scrollTop = 0)
  await expect(rows.locator('.pivot-row-context')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Pivot · připnuté skupiny řádků', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vapor-table-pivot-dom?grouped=true')
  expect(problems).toEqual([])
})
