import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'
import { expectPaintedColorIcon, expectRenderedIcon } from './runtime-icon-assertions.mjs'

assertRendererDiagnostics(test)

async function open(page, extra = '') {
  await page.goto(`/cs-CZ/vapor-runtime-icons${extra}`)
  await expect(page.getByTestId('runtime-icons')).toHaveAttribute('data-ready', 'true')
}

test('HTTP-supplied icons render mask, colors, custom SVG, alias and legacy formats', async ({ page, request }) => {
  await open(page)
  const names = await (await request.get('/api/playground/runtime-icons')).json()
  const manifest = await (await request.get('/_icons/manifest.json')).json()
  expect(manifest[names.mask]).toBeUndefined()
  const mask = await expectRenderedIcon(page.getByTestId('runtime-mask'), { name: names.mask })
  expect(mask.width).toBe(32)
  await expectRenderedIcon(page.getByTestId('runtime-background'), { mode: 'background', name: names.background, colors: true })
  await expectRenderedIcon(page.getByTestId('runtime-custom'), { name: names.custom })
  await expectRenderedIcon(page.getByTestId('runtime-alias'), { name: names.custom })
  await expectRenderedIcon(page.getByTestId('runtime-button').locator('[data-icon]'), { name: names.mask })
  const chip = page.getByTestId('runtime-chip').locator('[data-icon]')
  const chipIcon = await expectRenderedIcon(chip, { name: names.mask })
  expect(chipIcon.width).toBe(16)
  await expect(chip).toHaveClass(/rotate-90/)
  const asset = page.getByTestId('static-icon')
  await expectRenderedIcon(asset)
  await expect(asset).toHaveAttribute('style', /\/_icons\/lucide-check\.[\w-]+\.svg/)
  await expect(page.getByTestId('missing-icon')).toHaveAttribute('data-icon-status', 'missing')
  expect(await page.getByTestId('missing-icon').evaluate(element => getComputedStyle(element).maskImage)).toBe('none')
  await expect(page.getByRole('link', { name: 'Nativní runtime ikony', exact: true })).toHaveAttribute('href', '/cs-CZ/vapor-runtime-icons')
  await expect(page.getByRole('link', { name: 'Runtime ikony · pomalá odpověď', exact: true })).toHaveAttribute('href', '/cs-CZ/vapor-runtime-icons?mode=slow')
})

test('duplicates share payload/cache and remount offline without another icon request', async ({ page, context }) => {
  const requests = []
  page.on('request', request => {
    if (request.url().includes('/api/runtime-icon?')) {
      requests.push(request.url())
    }
  })
  const manifest = page.waitForResponse(response => response.url().includes('/builds/meta/'))
  await open(page)
  expect(await (await manifest).finished()).toBeNull()
  await expectRenderedIcon(page.getByTestId('runtime-mask'))
  expect(requests).toEqual([])
  await context.setOffline(true)
  try {
    await page.getByRole('button', { name: 'Toggle icon owner', exact: true }).click()
    await expect(page.getByTestId('icon-owner')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle icon owner', exact: true }).click()
    await expectRenderedIcon(page.getByTestId('runtime-mask'))
    await expectRenderedIcon(page.getByTestId('runtime-background'), { mode: 'background', colors: true })
    expect(requests).toEqual([])
  } finally {
    await context.setOffline(false)
  }
})

test('a delayed provider result cannot overwrite a changed name or update a disposed owner', async ({ page }) => {
  await open(page)
  const pending = page.waitForRequest(request => new URL(request.url()).searchParams.get('name') === 'playground:runtime-slow')
  await page.getByRole('button', { name: 'Start slow runtime icon', exact: true }).click()
  const slow = await pending
  await expect(page.getByTestId('runtime-mask')).not.toHaveAttribute('data-icon-mode')
  await page.getByRole('button', { name: 'Change runtime icon', exact: true }).click()
  await expectRenderedIcon(page.getByTestId('runtime-mask'), { name: 'solar:planet-bold-duotone' })
  await slow.response()
  await expect(page.getByTestId('runtime-mask')).toHaveAttribute('data-icon', 'solar:planet-bold-duotone')
  const pendingOwner = page.waitForRequest(request => new URL(request.url()).searchParams.get('name') === 'playground:runtime-slow')
  await page.getByRole('button', { name: 'Start slow runtime icon', exact: true }).click()
  const disposing = await pendingOwner
  await page.getByRole('button', { name: 'Toggle icon owner', exact: true }).click()
  await expect(page.getByTestId('icon-owner')).toHaveCount(0)
  await disposing.response()
  await page.getByRole('button', { name: 'Change runtime icon', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle icon owner', exact: true }).click()
  await expectRenderedIcon(page.getByTestId('runtime-mask'), { name: 'lucide:telescope' })
})

test('provider failures keep a quiet fallback, retry on remount and recover with another name', async ({ page }) => {
  await open(page)
  const failed = () => page.waitForResponse(response => new URL(response.url()).searchParams.get('name') === 'playground:runtime-failed')
  const initial = failed()
  await page.getByRole('button', { name: 'Fail runtime icon provider', exact: true }).click()
  const response = await initial
  expect(response.status()).toBe(200)
  expect((await response.json()).status).toBe('unavailable')
  await expect(page.getByTestId('runtime-mask')).not.toHaveAttribute('data-icon-mode')
  await page.getByRole('button', { name: 'Toggle icon owner', exact: true }).click()
  const retry = failed()
  await page.getByRole('button', { name: 'Toggle icon owner', exact: true }).click()
  expect((await (await retry).json()).status).toBe('unavailable')
  await page.getByRole('button', { name: 'Change runtime icon', exact: true }).click()
  await expectRenderedIcon(page.getByTestId('runtime-mask'), { name: 'solar:planet-bold-duotone' })
})

test('real SSR SVG styles survive JavaScript-disabled rendering and hydration without refetch', async ({ browser, baseURL, page }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const server = await context.newPage()
    await server.goto('/cs-CZ/vapor-runtime-icons')
    const before = await server.getByTestId('icon-owner').locator('[data-icon]').evaluateAll(elements => elements.map(element => ({ name: element.dataset.icon, mode: element.dataset.iconMode, style: element.getAttribute('style'), status: element.dataset.iconStatus })))
    expect(before.filter(icon => icon.status === 'ready').length).toBe(7)
    await expectPaintedColorIcon(server.getByTestId('runtime-background'))
    const requests = []
    page.on('request', request => {
      if (request.url().includes('/api/runtime-icon?')) {
        requests.push(request.url())
      }
    })
    await open(page)
    const after = await page.getByTestId('icon-owner').locator('[data-icon]').evaluateAll(elements => elements.map(element => ({ name: element.dataset.icon, mode: element.dataset.iconMode, style: element.getAttribute('style'), status: element.dataset.iconStatus })))
    expect(after).toEqual(before)
    expect(requests).toEqual([])
  } finally {
    await context.close()
  }
})
