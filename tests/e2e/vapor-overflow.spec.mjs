import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'
import { assertHoverScroll } from './hover-scroll-assertions.mjs'

assertRendererDiagnostics(test)

for (const reducedMotion of ['no-preference', 'reduce']) {
  test(`hover scrolling respects ${reducedMotion} and cancels when its owner disappears`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('/cs-CZ/vapor-overflow?mode=hover-scroll')
    await expect(page.getByRole('link', { name: 'Hover text · omezení animací', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-overflow?mode=hover-scroll')
    await assertHoverScroll({
      page,
      reducedMotion,
      removeOwner: () => page.getByRole('button', { name: 'Refresh and remove owner', exact: true }).evaluate(el => el.click()),
    })
    await expect(page.getByTestId('overflow')).toHaveCount(0)
  })
}

test('an overflow callback may resize its observed element without a delivery loop', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-overflow?mode=resize-handler')
  const fixture = page.getByTestId('overflow')
  await expect(fixture).toHaveAttribute('data-ready', 'true')
  await expect(fixture.getByTestId('first-calls')).toHaveText('2')
  await expect(fixture.getByTestId('first-result')).toHaveText('false')
  await expect(fixture.getByTestId('second-calls')).toHaveText('1')
  await expect(fixture.locator('.overflow-box').first()).toHaveCSS('width', '240px')
  await expect(page.getByRole('link', { name: 'Overflow · změna rozměru v callbacku', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vapor-overflow?mode=resize-handler')
  const reports = await page.getByTestId('overflow-reports').textContent()
  await page.getByRole('button', { name: 'Refresh and remove owner', exact: true }).click()
  await expect(fixture).toHaveCount(0)
  await expect(page.getByTestId('overflow-reports')).toHaveText(reports)
})

test('overflow autoimport isolates registrations and resolve refreshed DOM refs after updates', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-overflow')

  const fixture = page.getByTestId('overflow')
  const action = name => fixture.getByRole('button', { name, exact: true }).click()
  await expect(fixture).toHaveAttribute('data-ready', 'true')
  await expect(fixture.getByTestId('first-result')).toHaveText('true')
  await expect(fixture.getByTestId('second-result')).toHaveText('true')
  await expect(fixture.getByTestId('difference')).toHaveText('{"xDiff":100}')
  await expect(fixture.getByTestId('first-calls')).toHaveText('1')
  await expect(fixture.getByTestId('second-calls')).toHaveText('1')

  await action('Resize first')
  await expect(fixture.getByTestId('first-result')).toHaveText('false')
  await expect(fixture.getByTestId('second-calls')).toHaveText('1')
  await action('Resize first')
  await expect(fixture.getByTestId('first-result')).toHaveText('true')
  await action('Raise threshold')
  await expect(fixture.getByTestId('first-result')).toHaveText('false')
  await expect(fixture.getByTestId('difference')).toHaveText('{"xDiff":100}')
  const before = Number(await fixture.getByTestId('first-calls').textContent())
  await action('Refresh')
  await expect(fixture.getByTestId('first-calls')).toHaveText(String(before + 1))
  await action('Remove and refresh')
  await expect(fixture.getByTestId('first-calls')).toHaveText(String(before + 1))
  await action('Restore first')
  await expect(fixture.getByTestId('first-calls')).toHaveText(String(before + 2))

  const reports = await page.getByTestId('overflow-reports').textContent()
  await page.getByRole('button', { name: 'Refresh and remove owner' }).click()
  await expect(page.getByTestId('overflow')).toHaveCount(0)
  await expect(page.getByTestId('overflow-reports')).toHaveText(reports)
  expect(errors).toEqual([])
})

test('overflow observers do not run during SSR', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-overflow')
    expect(response.status()).toBe(200)
    const fixture = page.getByTestId('overflow')
    await expect(fixture).toHaveAttribute('data-ready', 'false')
    await expect(fixture.getByTestId('first-calls')).toHaveText('0')
  } finally {
    await context.close()
  }
})
