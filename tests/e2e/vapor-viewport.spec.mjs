import { expect, test } from '@playwright/test'

for (const hints of [false, true]) {
  test(`viewport SSR uses ${hints ? 'client hints before cookies' : 'cookies before device guess'}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      extraHTTPHeaders: hints ? { 'sec-ch-viewport-width': '1100', 'sec-ch-viewport-height': '700' } : {},
    })
    try {
      await context.addCookies([
        { name: 'screen_size', value: '900', url: baseURL },
        { name: 'screen_height', value: '600', url: baseURL },
      ])
      const page = await context.newPage()
      await page.goto('/cs-CZ/vapor-viewport')
      await expect(page.getByTestId('viewport')).toHaveText(hints ? '1100 × 700' : '900 × 600')
      await expect(page.getByRole('link', { name: 'Viewport · SSR a hydratace', exact: true }))
        .toHaveAttribute('href', '/cs-CZ/vapor-viewport')
    } finally {
      await context.close()
    }
  })
}

test('Nuxt startup replaces the SSR guess after hydration without component lifecycle warnings', async ({ page, context, baseURL }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component|onMounted is called/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await context.addCookies([
    { name: 'screen_size', value: '900', url: baseURL },
    { name: 'screen_height', value: '600', url: baseURL },
  ])
  await page.setViewportSize({ width: 1280, height: 800 })
  const response = await page.goto('/cs-CZ/vapor-viewport')
  expect(await response.text()).toMatch(/data-testid="viewport"[^>]*>900 × 600</)
  await expect(page.getByTestId('viewport')).toHaveText('1280 × 800')
  await expect.poll(async () => {
    const cookies = await context.cookies()

    return ['screen_size', 'screen_height'].map(name => cookies.find(cookie => cookie.name === name)?.value)
  }).toEqual(['1280', '800'])
  await page.setViewportSize({ width: 1000, height: 720 })
  await expect(page.getByTestId('viewport-cookies')).toHaveText('1000 × 720')
  // These values seed layout during hydration; ongoing resize is a separate API.
  await expect(page.getByTestId('viewport')).toHaveText('1280 × 800')
  await page.reload()
  await expect(page.getByTestId('viewport')).toHaveText('1000 × 720')
  expect(problems).toEqual([])
})
