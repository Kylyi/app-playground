import { expect, test } from '@playwright/test'

async function openTable(page, query = '') {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto(`/cs-CZ/vapor-table-fetch-more${query}`)
  await expect(page.getByTestId('table-fetch-more')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.table-content.virtual-scroll')).toBeVisible()

  return { scroller: page.locator('.table-content.virtual-scroll'), errors }
}

function read(page, id) {
  return page.getByTestId(id).evaluate(el => JSON.parse(el.textContent))
}

function bottom(scroller) {
  return scroller.evaluate(el => {
    el.scrollTop = el.scrollHeight
    el.dispatchEvent(new Event('scroll'))
  })
}

test('Table fetchMore preserves pages, scroll position, row measurements and stops at total count', async ({ page }) => {
  const { scroller, errors } = await openTable(page)
  await expect.poll(() => read(page, 'loaded-ids')).toEqual(Array.from({ length: 25 }, (_, id) => id))
  await expect(scroller).toHaveClass(/is-virtual/)
  await page.getByRole('button', { name: 'Toggle fetch veto' }).click()
  await bottom(scroller)
  await expect(scroller.locator('.virtual-scroll__row[data-key="24"]')).toBeVisible()
  // Let both the scroll callback and the delayed fetch window elapse.
  await page.waitForTimeout(400)
  expect(await read(page, 'requests')).toHaveLength(1)
  await page.getByRole('button', { name: 'Toggle fetch veto' }).click()
  await scroller.evaluate(el => el.scrollTop -= 32)
  await expect(page.getByTestId('pending')).toHaveText('1')
  const topBefore = await scroller.evaluate(el => el.scrollTop)
  await scroller.dispatchEvent('scroll')
  await scroller.dispatchEvent('scroll')
  await expect.poll(() => read(page, 'loaded-ids')).toHaveLength(50)
  expect(await scroller.evaluate(el => el.scrollTop)).toBe(topBefore)
  await expect(page.getByTestId('max-pending')).toHaveText('1')

  await page.getByRole('button', { name: 'Toggle row height' }).click()
  await expect.poll(() => scroller.locator('.virtual-scroll__row[data-key="20"]').evaluate(el => el.clientHeight)).toBeGreaterThanOrEqual(96)
  await expect.poll(() => scroller.locator('.virtual-scroll__row[data-key="21"]').evaluate(el => Math.round(el.getBoundingClientRect().top - el.previousElementSibling.getBoundingClientRect().bottom))).toBe(0)
  await page.getByRole('button', { name: 'Toggle row height' }).click()
  await expect.poll(() => scroller.locator('.virtual-scroll__row[data-key="20"]').evaluate(el => el.clientHeight)).toBeLessThan(96)
  for (const count of [75, 83]) {
    await bottom(scroller)
    await expect.poll(() => read(page, 'loaded-ids')).toHaveLength(count)
  }
  await bottom(scroller)
  await expect(scroller.locator('.virtual-scroll__row[data-key="82"]')).toBeVisible()
  await expect(page.getByTestId('has-more')).toHaveText('false')
  await scroller.evaluate(el => el.scrollTop -= 32)
  await bottom(scroller)
  await page.waitForTimeout(400)
  expect(await read(page, 'requests')).toEqual([
    { skip: 0, last: null, search: '' },
    { skip: 25, last: 24, search: '' },
    { skip: 50, last: 49, search: '' },
    { skip: 75, last: 74, search: '' },
  ])
  expect(await read(page, 'loaded-ids')).toEqual(Array.from({ length: 83 }, (_, id) => id))
  // Visit every loaded page through real DOM recycling, including the seams.
  const seen = new Set()
  await page.getByRole('button', { name: 'Scroll to top', exact: true }).click()
  for (let index = 0; index < 83; index += 5) {
    await scroller.evaluate((el, top) => el.scrollTop = top, index * 33)
    await expect(scroller.locator(`.virtual-scroll__row[data-key="${index}"]`)).toBeVisible()
    const keys = await scroller.locator('.virtual-scroll__row').evaluateAll(rows => rows.map(row => Number(row.dataset.key)))
    expect(new Set(keys).size).toBe(keys.length)
    keys.forEach(key => seen.add(key))
  }
  expect([...seen].sort((a, b) => a - b)).toEqual(Array.from({ length: 83 }, (_, id) => id))
  await page.getByRole('button', { name: 'Filter data' }).click()
  await expect.poll(() => read(page, 'loaded-ids')).toEqual(Array.from({ length: 12 }, (_, id) => 1000 + id))
  await expect(scroller.locator('.virtual-scroll__row[data-key="1011"]')).toBeVisible()
  await expect(scroller.locator('.virtual-scroll__row[data-key="82"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Scroll to top', exact: true }).click()
  await expect(scroller.locator('.virtual-scroll__row[data-key="1000"]')).toBeVisible()
  await expect.poll(() => scroller.evaluate(el => el.scrollTop)).toBe(0)
  expect((await read(page, 'requests')).at(-1)).toEqual({ skip: 0, last: null, search: 'filtered' })
  await page.getByRole('button', { name: 'Reload data' }).click()
  await expect(page.getByTestId('pending')).toHaveText('1')
  await expect(page.getByTestId('pending')).toHaveText('0')
  expect(await read(page, 'loaded-ids')).toHaveLength(12)
  expect(errors).toEqual([])
})

test('Table fills an initially short viewport without user scrolling', async ({ page }) => {
  const { scroller, errors } = await openTable(page, '?short=true')
  await expect.poll(() => read(page, 'loaded-ids')).toHaveLength(9)
  await expect.poll(() => scroller.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
  await expect(page.getByTestId('pending')).toHaveText('0')
  expect(await read(page, 'requests')).toEqual([
    { skip: 0, last: null, search: '' },
    { skip: 3, last: 2, search: '' },
    { skip: 6, last: 5, search: '' },
  ])
  await bottom(scroller)
  await expect.poll(async () => (await read(page, 'loaded-ids')).length).toBeGreaterThan(9)
  await expect(scroller).toHaveClass(/is-virtual/)
  await expect(page.getByTestId('max-pending')).toHaveText('1')
  await expect(page.getByRole('link', { name: 'Table · doplnění viewportu', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vapor-table-fetch-more?short=true')
  expect(errors).toEqual([])
})

test('fullscreen Table loads 20 of 1,000, fills itself, refills on resize and reaches the end', async ({ page }) => {
  test.setTimeout(60000)
  await page.setViewportSize({ width: 1280, height: 1200 })
  const { scroller, errors } = await openTable(page, '?fullscreen=true')
  await expect.poll(() => read(page, 'loaded-ids')).toHaveLength(40)
  await expect.poll(() => scroller.evaluate(el => el.clientHeight)).toBeGreaterThan(20 * 33)
  await expect.poll(() => scroller.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
  expect(await scroller.evaluate(el => el.scrollTop)).toBe(0)
  await expect(page.getByTestId('pending')).toHaveText('0')
  await page.waitForTimeout(400)
  expect(await read(page, 'requests')).toEqual([
    { skip: 0, last: null, search: '' },
    { skip: 20, last: 19, search: '' },
  ])

  await scroller.evaluate(el => el.scrollLeft = 40 * 160)
  await expect(scroller.locator('.td[data-key="0"][data-field="field_40"]')).toHaveText('Item 0 field_40')
  expect(await scroller.evaluate(el => el.scrollTop)).toBe(0)
  expect(await read(page, 'requests')).toHaveLength(2)
  await scroller.evaluate(el => el.scrollLeft = 0)
  await expect(scroller.locator('.td[data-key="0"][data-field="name"]')).toHaveText('Item 0')

  // Increasing the viewport must fetch again without any wheel/scroll input.
  await page.setViewportSize({ width: 1280, height: 1800 })
  await expect.poll(() => read(page, 'loaded-ids')).toHaveLength(60)
  expect(await scroller.evaluate(el => el.scrollTop)).toBe(0)
  await page.setViewportSize({ width: 1280, height: 900 })
  let renderedHeight = await scroller.evaluate(el => el.scrollHeight)
  for (let count = 80; count <= 1000; count += 20) {
    await bottom(scroller)
    await expect.poll(() => read(page, 'loaded-ids')).toHaveLength(count)
    await expect.poll(() => scroller.evaluate(el => el.scrollHeight)).toBeGreaterThan(renderedHeight)
    renderedHeight = await scroller.evaluate(el => el.scrollHeight)
  }
  await bottom(scroller)
  await expect(scroller.locator('.virtual-scroll__row[data-key="999"]')).toBeVisible()
  await expect(page.getByTestId('has-more')).toHaveText('false')
  await expect(page.getByTestId('max-pending')).toHaveText('1')
  await expect.poll(() => scroller.locator('.virtual-scroll__row').count()).toBeLessThan(100)
  await scroller.evaluate(el => el.scrollTop -= 32)
  await bottom(scroller)
  await page.waitForTimeout(400)
  expect(await read(page, 'requests')).toEqual(Array.from({ length: 50 }, (_, index) => ({
    skip: index * 20,
    last: index ? index * 20 - 1 : null,
    search: '',
  })))
  expect(await read(page, 'loaded-ids')).toEqual(Array.from({ length: 1000 }, (_, id) => id))
  await expect(page.getByRole('link', { name: 'Table · celá obrazovka, 20 / 1 000', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vapor-table-fetch-more?fullscreen=true')
  expect(errors).toEqual([])
})
