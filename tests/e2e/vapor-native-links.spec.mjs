import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

async function open(page, options = {}) {
  const locale = options.locale ?? 'cs-CZ'
  const manifest = page.waitForResponse(response => response.url().includes('/builds/meta/'))
  await page.goto(`/${locale}/vapor-native-links${options.card ? '?mode=card' : ''}`)
  expect(await (await manifest).finished()).toBeNull()
  await expect(page.getByTestId('native-links')).toHaveAttribute('data-ready', 'true')

  return page.getByTestId('link-owner')
}

for (const card of [false, true]) {
  test(`native UI link branches have real anchors, live targets and survive remount (card=${card})`, async ({ page }) => {
    const owner = await open(page, { card })
    for (const testId of ['plain-link', 'button-link', 'chip-link', 'card-link', 'single-selector-link', 'multi-selector-link', 'cell-link-table', 'row-link-table']) {
      const container = owner.getByTestId(testId)
      const link = await container.evaluate(element => element.tagName === 'A') ? container : container.locator('a').first()
      await expect(link).toHaveAttribute('href', '/cs-CZ/vapor-native-links-target?item=alpha')
      await expect(link).toHaveAccessibleName(/\S/)
    }
    await expect(owner.getByTestId('file-link').getByRole('link')).toHaveAttribute('href', '/link-test.txt')
    const mixed = owner.getByTestId('mixed-link-table')
    await expect(mixed.locator('a a')).toHaveCount(0)
    await expect(mixed.locator('.row-link')).toHaveAccessibleName('1 Cell destination')
    await expect(mixed.locator('.td a')).toHaveAttribute('href', '/cs-CZ/vapor-native-links-target?item=alpha')
    await expect(owner.getByTestId('current-link')).toHaveClass(/router-link-exact-active/)
    await expect(owner.getByTestId('current-link')).toHaveAttribute('aria-current', 'page')
    await page.getByRole('button', { name: 'Change link target', exact: true }).click()
    await expect(owner.getByTestId('chip-link').getByRole('link')).toHaveAttribute('href', '/cs-CZ/vapor-native-links-target?item=beta')
    await page.getByRole('button', { name: 'Focus native link', exact: true }).click()
    await expect(owner.getByTestId('plain-link')).toBeFocused()
    await page.getByRole('button', { name: 'Toggle link owner', exact: true }).click()
    await expect(owner).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle link owner', exact: true }).click()
    await expect(owner.getByTestId('plain-link')).toHaveAttribute('href', '/cs-CZ/vapor-native-links-target?item=beta')
    await expect(page.getByRole('link', { name: card ? 'Nativní odkazy · kartová tabulka' : 'Nativní UI odkazy', exact: true }))
      .toHaveAttribute('href', `/cs-CZ/vapor-native-links${card ? '?mode=card' : ''}`)
  })
}

for (const locale of ['cs-CZ', 'en-US']) {
  test(`native links navigate named routes with query and support browser back (${locale})`, async ({ page }) => {
    await open(page, { locale })
    await page.getByTestId('named-link').click()
    await expect(page.getByTestId('link-destination')).toBeVisible()
    await expect(page.getByTestId('destination-item')).toHaveText('named')
    await expect(page).toHaveURL(new RegExp(`/${locale}/vapor-native-links-target\\?item=named$`))
    await page.goBack()
    await expect(page.getByTestId('native-links')).toHaveAttribute('data-ready', 'true')
    await page.getByTestId('plain-link').focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('destination-item')).toHaveText('alpha')
    await page.goBack()
    await page.evaluate(() => window.nativeLinkDocument = true)
    await page.getByTestId('external-object-link').click()
    await expect(page.getByTestId('destination-item')).toHaveText('named')
    expect(await page.evaluate(() => window.nativeLinkDocument)).toBeUndefined()
  })
}

test('replace, prevented/disabled links, hashes, downloads and new-tab clicks retain browser behavior', async ({ page }) => {
  await open(page)
  for (const id of ['disabled-link', 'unsafe-link']) {
    await expect(page.getByTestId(id)).not.toHaveAttribute('href')
  }
  await page.getByTestId('prevented-link').click()
  await page.getByTestId('prevented-button-link').click()
  await expect(page).toHaveURL(/\/cs-CZ\/vapor-native-links$/)
  await page.getByTestId('hash-link').click()
  await expect(page).toHaveURL(/#link-anchor$/)
  const popup = page.waitForEvent('popup')
  await page.getByTestId('blank-link').click()
  const child = await popup
  await expect(child).toHaveURL(/vapor-native-links-target\?item=alpha$/)
  await child.close()
  await expect(page.getByTestId('blank-link')).toHaveAttribute('rel', 'noopener noreferrer')
  for (const id of ['download-link', 'empty-download-link', 'boolean-download-link']) {
    const download = page.waitForEvent('download')
    await page.getByTestId(id).click()
    expect((await download).suggestedFilename()).toBe('link-test.txt')
  }
  await page.getByTestId('replace-link').click()
  await expect(page.getByTestId('link-destination')).toBeVisible()
  await page.goBack()
  // The anchor click added a history entry before replacement.
  await expect(page).toHaveURL(/\/cs-CZ\/vapor-native-links$/)
})

test('whole-row and cell links navigate independently without nesting anchors', async ({ page }) => {
  await open(page)
  await page.getByTestId('mixed-link-table').locator('.td a').click()
  await expect(page.getByTestId('destination-item')).toHaveText('alpha')
  await expect(page).not.toHaveURL(/source=row/)
  await page.goBack()
  const row = page.getByTestId('mixed-link-table').locator('.row-link')
  await row.click({ position: { x: 12, y: 12 } })
  await expect(page).toHaveURL(/item=alpha&source=row$/)
  await page.goBack()
  await row.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/item=alpha&source=row$/)
})

test('interaction prefetch is opt-in and remounting card links keeps resize observers stable', async ({ page }) => {
  await open(page, { card: true })
  const interaction = page.getByTestId('interaction-link')
  await expect(interaction).not.toHaveClass(/interaction-ready/)
  await interaction.focus()
  await expect(interaction).toHaveClass(/interaction-ready/)
  await page.getByTestId('no-prefetch-link').focus()
  await expect(page.getByTestId('no-prefetch-link')).not.toHaveClass(/router-link-prefetched/)
  for (let cycle = 0; cycle < 5; cycle++) {
    await page.getByRole('button', { name: 'Toggle link owner', exact: true }).click()
    await expect(page.getByTestId('link-owner')).toHaveCount(0)
    await page.setViewportSize({ width: cycle % 2 ? 1280 : 390, height: 844 })
    await page.getByRole('button', { name: 'Toggle link owner', exact: true }).click()
    await expect(page.getByTestId('mixed-link-table').locator('.row-link')).toHaveAccessibleName('1 Cell destination')
    await page.getByTestId('mixed-link-table').scrollIntoViewIfNeeded()
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  }
})

test('modifier and middle clicks retain native browser handling without SPA interception', async ({ page }) => {
  await open(page)
  const original = page.url()
  const destination = new URL(await page.getByTestId('plain-link').getAttribute('href'), original).href
  // WebKit's automation surface does not create a tab for a Meta-click on
  // macOS. Assert the real input event reaches browser defaults on every
  // engine; target=_blank is separately tested with an actual destination tab.
  const clicks = []
  await page.exposeFunction('recordLinkClick', event => clicks.push(event))
  await page.evaluate(() => {
    for (const type of ['click', 'auxclick', 'mouseup']) {
      document.addEventListener(type, event => {
        if (event.target.closest('[data-testid="plain-link"]')) {
          void window.recordLinkClick({ type, button: event.button, meta: event.metaKey, prevented: event.defaultPrevented })
        }
      })
    }
  })
  for (const options of [{ modifiers: ['Meta'] }, { button: 'middle' }]) {
    await page.getByTestId('plain-link').click(options)
    if (options.modifiers) {
      await expect(page).toHaveURL(original)
    } else {
      // WebKit may reuse this document for a native middle-click; a plain
      // HTML anchor does the same. Both browser defaults remain valid.
      expect([original, destination]).toContain(page.url())
    }
  }
  await expect.poll(() => clicks.some(event => event.type === 'click' && event.button === 0 && event.meta && !event.prevented)).toBe(true)
  await expect.poll(() => clicks.some(event => event.button === 1 && !event.prevented)).toBe(true)
  expect(clicks.filter(event => event.prevented)).toEqual([])
})

for (const card of [false, true]) {
  test(`server UI links preserve labels and URLs and hydrate the same anchors (card=${card})`, async ({ browser, baseURL, page }) => {
    const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
    try {
      const server = await context.newPage()
      for (const locale of ['cs-CZ', 'en-US']) {
        await context.addCookies([{ name: 'lang', value: locale, url: baseURL }])
        await page.context().addCookies([{ name: 'lang', value: locale, url: baseURL }])
        await server.goto(`/${locale}/vapor-native-links${card ? '?mode=card' : ''}`)
        const links = server.getByTestId('link-owner').locator('a[href]')
        const before = await links.evaluateAll(elements => elements.map(element => ({ href: element.getAttribute('href'), text: element.textContent.trim() })))
        expect(before.some(link => link.text === 'Chip destination')).toBe(true)
        const localizedTarget = `${locale === 'en-US' ? '' : '/cs-CZ'}/vapor-native-links-target?item=alpha`
        expect(before.filter(link => link.href === localizedTarget).length).toBeGreaterThanOrEqual(8)
        await open(page, { locale, card })
        const after = await page.getByTestId('link-owner').locator('a[href]').evaluateAll(elements => elements.map(element => ({ href: element.getAttribute('href'), text: element.textContent.trim() })))
        expect(after).toEqual(before)
      }
    } finally {
      await context.close()
    }
  })
}
