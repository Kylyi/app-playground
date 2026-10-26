import { expect, test } from '@playwright/test'
import { expectSelectionCleared, expectSelectionDisabled } from '../e2e/gesture-selection.mjs'
import { captureState } from '../visual/capture-state.mjs'
import { observeRendererDiagnostics } from '../e2e/renderer-diagnostics.mjs'
import { expectRenderedIcon } from '../e2e/runtime-icon-assertions.mjs'
import { assertHoverScroll } from '../e2e/hover-scroll-assertions.mjs'
import { assertPivotCellContracts } from '../e2e/pivot-cell-contracts.mjs'
import { assertTableCellSlots } from '../e2e/table-cell-contracts.mjs'
import { assertTreeSourceCommit } from '../e2e/tree-source-contracts.mjs'
import process from 'node:process'

const problems = new WeakMap()
test.beforeEach(async ({ page }) => {
  problems.set(page, observeRendererDiagnostics(page))
})
test.afterEach(async ({ page }, testInfo) => {
  expect(problems.get(page)).toEqual([])
  if (process.env.E2E_CAPTURE === '1' && testInfo.status === 'passed'
    && await page.locator('html').getAttribute('data-native-app') === 'true') {
    await captureState({ page, testInfo, target: page.locator('main'), state: 'native-final', families: [] })
  }
})

async function open(page, family, extra = '') {
  await page.goto(`/?family=${family}${extra}`)
  await expect(page.locator('html')).toHaveAttribute('data-native-app', 'true')
  await expect(page.locator('html')).toHaveAttribute('data-interop', 'false')
  await expect(page.getByTestId('native-inventory')).toHaveText('242/242')
}

test('native ordinary and standalone Pivot cells preserve their public contracts without interop', async ({ page }) => {
  await open(page, 'pivot', '&cells=true')
  await assertPivotCellContracts(page, 'en-US')
  await page.getByTestId('unmount-native-app').click()
  await expect(page.getByTestId('standalone-pivot-cell')).toHaveCount(0)
})

test('native Table keeps dynamic and empty cell slot fallbacks across regular and card views', async ({ page }) => {
  await open(page, 'measurement')
  await assertTableCellSlots(page)
  await page.getByTestId('unmount-native-app').click()
  await expect(page.getByTestId('measured-table')).toHaveCount(0)
})

test('native Tree preserves edited source items when the model is committed after built-in or custom search', async ({ page }) => {
  for (const mode of ['filtered', 'custom']) {
    await open(page, 'tree', `&mode=${mode}`)
    await assertTreeSourceCommit(page)
    await page.getByTestId('unmount-native-app').click()
    await expect(page.locator('.tree-node')).toHaveCount(0)
  }
})

for (const reducedMotion of ['no-preference', 'reduce']) {
  test(`native hover scrolling respects ${reducedMotion} and disposes its live animation`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await open(page, 'overflow', '&mode=hover-scroll')
    await assertHoverScroll({
      page,
      reducedMotion,
      removeOwner: () => page.getByTestId('unmount-native-app').click(),
    })
    await expect(page.locator('html')).toHaveAttribute('data-native-app', 'false')
  })
}

test('native overflow callback can resize its target and stops when the app is removed', async ({ page }) => {
  await open(page, 'overflow', '&mode=resize-handler')
  const fixture = page.getByTestId('overflow')
  await expect(fixture).toHaveAttribute('data-ready', 'true')
  await expect(fixture.getByTestId('first-calls')).toHaveText('2')
  await expect(fixture.getByTestId('first-result')).toHaveText('false')
  await expect(fixture.getByTestId('second-calls')).toHaveText('1')
  await fixture.getByRole('button', { name: 'Remove and refresh', exact: true }).click()
  await expect(fixture.locator('.overflow-box')).toHaveCount(1)
  await expect(fixture.getByTestId('first-calls')).toHaveText('2')
  await page.getByTestId('unmount-native-app').click()
  await expect(page.locator('html')).toHaveAttribute('data-native-app', 'false')
  await expect(fixture).toHaveCount(0)
})

test('native bundle excludes the VDOM renderer and interop implementations', async ({ request }) => {
  const response = await request.get('/_nuxt/native-bundle.json')
  expect(response.ok()).toBe(true)
  const report = await response.json()
  expect(report.auditStage).toBe('final-public-assets')
  expect(report.bootstrap).toBe('createVaporApp')
  expect(report.interopInstalled).toBe(false)
  for (const symbol of ['baseCreateRenderer', 'ensureRenderer', 'vaporInteropImpl', 'vaporInteropPlugin']) {
    expect(report.retainedVDOM).not.toContain(symbol)
  }
  expect(report.chunks.length).toBeGreaterThan(0)
  expect(report.iconRendererModules).toEqual([])
  expect(report.compiledUI).toHaveLength(242)
  expect(report.compiledUI.flatMap(component => component.vdomImports)).toEqual([])
})

for (const mode of ['imported', 'registered', 'resolver']) {
  test(`native consumer component descriptors work without interop (${mode})`, async ({ page }) => {
    await open(page, 'contracts', `&mode=${mode}`)
    const input = page.getByTestId('consumer-owner').locator('input')
    await expect(input).toHaveValue('Initial consumer value')
    await expect(page.getByTestId('consumer-queue-size')).toHaveText('2')
    await page.getByRole('button', { name: 'Focus consumer editor', exact: true }).click()
    await expect(input).toBeFocused()
    await input.fill('Native consumer update')
    await expect(page.getByTestId('consumer-value')).toHaveText('Native consumer update')
    await expect(page.getByTestId('consumer-updates')).toHaveText('1')
    await page.getByRole('button', { name: 'Replace consumer value', exact: true }).click()
    await expect(input).toHaveValue('Parent replacement')
    await page.getByRole('button', { name: 'Consumer zero', exact: true }).click()
    await expect(page.getByTestId('consumer-selection')).toHaveText('Consumer zero')
    await page.getByRole('button', { name: 'Toggle callable component', exact: true }).click()
    await expect(page.getByTestId('callable-content')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle consumer', exact: true }).click()
    await expect(input).toHaveCount(0)
    await expect(page.getByTestId('consumer-queue-size')).toHaveText('0')
    await page.getByRole('button', { name: 'Toggle consumer', exact: true }).click()
    await expect(input).toHaveValue('Parent replacement')
    await expect(page.getByTestId('consumer-queue-size')).toHaveText('2')
    await page.getByTestId('unmount-native-app').click()
    await expect(page.locator('html')).toHaveAttribute('data-native-app', 'false')
    await expect(page.getByTestId('consumer-owner')).toHaveCount(0)
  })
}

test('native Collapse resizes content and clears its observers when the owner disappears', async ({ page }) => {
  await open(page, 'collapse')
  const content = page.getByTestId('consumer-collapse').locator('.collapse__content')
  const height = () => content.evaluate(el => Math.round(el.getBoundingClientRect().height))
  const frame = await content.evaluate(el => {
    const style = getComputedStyle(el)
    const border = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)

    return { border, outside: style.boxSizing === 'border-box' ? 0 : border }
  })
  await expect.poll(height).toBe(60 + frame.border)
  await page.getByRole('button', { name: 'Grow collapse content', exact: true }).click()
  await expect.poll(height).toBe(180 + frame.border)
  await page.getByRole('button', { name: 'Cap collapse height', exact: true }).click()
  await expect.poll(height).toBe(80 + frame.outside)
  await page.getByRole('button', { name: 'Zero collapse height', exact: true }).click()
  await expect(content).toHaveCSS('max-height', '0px')
  const header = page.getByTestId('consumer-collapse').locator('.collapse__header')
  await header.click()
  await expect(content).not.toBeVisible()
  await expect(content).toHaveCSS('max-height', '0px')
  await header.click()
  await page.getByRole('button', { name: 'Cap collapse height', exact: true }).click()
  await expect.poll(height).toBe(80 + frame.outside)
  await page.getByRole('button', { name: 'Toggle collapse owner', exact: true }).click()
  await expect(content).toHaveCount(0)
  await page.getByRole('button', { name: 'Shrink collapse content', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle collapse owner', exact: true }).click()
  await expect.poll(height).toBe(40 + frame.border)
  await page.getByTestId('unmount-native-app').click()
  await expect(page.locator('html')).toHaveAttribute('data-native-app', 'false')
})

test('native Pivot worker commits rows after empty startup and repeated remounts', async ({ page }) => {
  await open(page, 'pivot-worker')
  const pivot = page.getByTestId('worker-pivot')
  await expect(pivot).toContainText('Worker record 0')
  for (let revision = 1; revision <= 2; revision++) {
    await page.getByRole('button', { name: 'Toggle worker Pivot', exact: true }).click()
    await expect(pivot).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle worker Pivot', exact: true }).click()
    await expect(pivot.locator('.pivot-content')).toBeVisible()
    await page.getByRole('button', { name: 'Replace worker Pivot data', exact: true }).click()
    await expect(pivot).toContainText(`Worker record 0 revision ${revision}`)
  }
  await page.getByTestId('unmount-native-app').click()
  await expect(pivot).toHaveCount(0)
})

for (const mode of ['', 'card']) {
  test(`native UI link branches render and update without interop (mode=${mode})`, async ({ page }) => {
    await open(page, 'links', mode ? `&mode=${mode}` : '')
    const owner = page.getByTestId('link-owner')
    for (const id of ['chip-link', 'card-link', 'single-selector-link', 'multi-selector-link', 'cell-link-table', 'row-link-table']) {
      const link = owner.getByTestId(id).locator('a').first()
      await expect(link).toHaveAttribute('href', '/vapor-native-links-target?item=alpha')
      await expect(link).toHaveAccessibleName(/\S/)
    }
    await expect(owner.getByTestId('file-link').getByRole('link')).toHaveAttribute('href', '/link-test.txt')
    await page.getByRole('button', { name: 'Change link target', exact: true }).click()
    await expect(owner.getByTestId('plain-link')).toHaveAttribute('href', '/vapor-native-links-target?item=beta')
    await page.getByRole('button', { name: 'Toggle link owner', exact: true }).click()
    await expect(owner).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle link owner', exact: true }).click()
    await expect(owner.getByTestId('chip-link')).toContainText('Chip destination')
    await page.getByTestId('unmount-native-app').click()
    await expect(owner).toHaveCount(0)
  })
}

test('native runtime icons render HTTP data, aliases, colors and survive owner removal', async ({ page }) => {
  const requests = []
  page.on('request', request => {
    if (request.url().includes('/api/runtime-icon?')) {
      requests.push(new URL(request.url()).searchParams.get('name'))
    }
  })
  await open(page, 'icons')
  await expectRenderedIcon(page.getByTestId('runtime-mask'), { name: 'lucide:telescope' })
  await expectRenderedIcon(page.getByTestId('runtime-background'), { mode: 'background', colors: true })
  await expectRenderedIcon(page.getByTestId('runtime-alias'), { name: 'playground:runtime-mark' })
  await expectRenderedIcon(page.getByTestId('runtime-chip').locator('[data-icon]'))
  expect(requests.filter(name => name === 'lucide:telescope')).toHaveLength(1)
  const before = requests.length
  await page.getByRole('button', { name: 'Toggle icon owner', exact: true }).click()
  await expect(page.getByTestId('icon-owner')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle icon owner', exact: true }).click()
  await expectRenderedIcon(page.getByTestId('runtime-mask'))
  expect(requests).toHaveLength(before)
  await page.getByTestId('unmount-native-app').click()
  await expect(page.locator('html')).toHaveAttribute('data-native-app', 'false')
})

test('native icon remounts release removed DOM and listeners', async ({ page, browserName }) => {
  await open(page, 'icons')
  await expectRenderedIcon(page.getByTestId('runtime-mask'))
  const toggle = page.getByRole('button', { name: 'Toggle icon owner', exact: true })
  const session = browserName === 'chromium' ? await page.context().newCDPSession(page) : undefined
  const checkpoints = []
  try {
    for (let cycle = 1; cycle <= 30; cycle++) {
      await toggle.click()
      await expect(page.getByTestId('icon-owner')).toHaveCount(0)
      if (session && [10, 20, 30].includes(cycle)) {
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await session.send('HeapProfiler.collectGarbage')
        checkpoints.push(await session.send('Memory.getDOMCounters'))
      }
      await toggle.click()
      await expectRenderedIcon(page.getByTestId('runtime-mask'))
    }
    // All engines exercise remounting. Chromium additionally exposes retained
    // DOM/listener counters after GC; no browser's behavior checks are skipped.
    if (session) {
      expect(checkpoints[2].nodes).toBeLessThanOrEqual(checkpoints[0].nodes)
      expect(checkpoints[2].jsEventListeners).toBe(checkpoints[0].jsEventListeners)
    }
  } finally {
    await session?.detach()
  }
})

test('native named-route links navigate, render their destination and restore on Back', async ({ page }) => {
  await open(page, 'links')
  const start = page.url()
  await page.getByTestId('named-link').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('link-destination')).toBeVisible()
  await expect(page.getByTestId('destination-item')).toHaveText('named')
  await expect(page).toHaveURL(/\/en-US\/vapor-native-links-target\?item=named$/)
  await page.goBack()
  await expect(page).toHaveURL(start)
  await expect(page.getByTestId('chip-link')).toContainText('Chip destination')
})

test('native icon requests discard stale data and abort when the whole app unmounts', async ({ page }) => {
  await open(page, 'icons')
  const pending = page.waitForRequest(request => new URL(request.url()).searchParams.get('name') === 'playground:runtime-slow')
  await page.getByRole('button', { name: 'Start slow runtime icon', exact: true }).click()
  const slow = await pending
  await page.getByRole('button', { name: 'Change runtime icon', exact: true }).click()
  await expectRenderedIcon(page.getByTestId('runtime-mask'), { name: 'solar:planet-bold-duotone' })
  await slow.response()
  await expect(page.getByTestId('runtime-mask')).toHaveAttribute('data-icon', 'solar:planet-bold-duotone')
  const disposing = page.waitForRequest(request => new URL(request.url()).searchParams.get('name') === 'playground:runtime-slow')
  await page.getByRole('button', { name: 'Start slow runtime icon', exact: true }).click()
  const request = await disposing
  await page.getByTestId('unmount-native-app').click()
  await request.response()
  await expect(page.locator('html')).toHaveAttribute('data-native-app', 'false')
  await expect(page.getByTestId('icon-owner')).toHaveCount(0)
})

test('native unavailable icons retain a quiet fallback and recover without interop', async ({ page }) => {
  await open(page, 'icons')
  await page.getByRole('button', { name: 'Fail runtime icon provider', exact: true }).click()
  await expect(page.getByTestId('runtime-mask')).toHaveAttribute('data-icon-status', 'unavailable')
  await expect(page.getByTestId('runtime-mask')).not.toHaveAttribute('data-icon-mode')
  await page.getByRole('button', { name: 'Change runtime icon', exact: true }).click()
  await expectRenderedIcon(page.getByTestId('runtime-mask'), { name: 'solar:planet-bold-duotone' })
})

test('native value contracts preserve readonly fallback and relative time without interop', async ({ page }) => {
  await open(page, 'values')
  await expect(page.getByTestId('zero-list').locator('.list-row-item.is-focused')).toContainText('Zero item')
  await expect(page.getByTestId('zero-selector').locator('.chip')).toContainText('Zero item')
  await expect(page.locator('[data-testid="input-block"].input-block__readonly')).toContainText('Current')
  const input = page.getByTestId('relative-time').locator('input')
  await input.fill('3')
  await expect(page.getByTestId('relative-value')).toHaveText('3m')
  await input.fill('')
  await expect(page.getByTestId('relative-value')).toHaveText('empty')
  await page.getByRole('button', { name: 'Replace relative time', exact: true }).click()
  await expect(input).toHaveValue('2')
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(page.getByTestId('relative-value')).toHaveText('2we')
})

test('native rejected Tree search reports its error and recovers without interop', async ({ page }, testInfo) => {
  await open(page, 'tree', '&mode=failed')
  await expect(page.getByTestId('tree-initial-pending')).toBeVisible()
  await page.getByRole('button', { name: 'Reject newest search', exact: true }).click()
  await expect(page.getByTestId('tree-search-error')).toHaveText('Custom search unavailable')
  await expect(page.getByTestId('tree-search-errors')).toHaveText('1')
  await captureState({ page, testInfo, target: page.locator('.tree'), state: 'native-search-error', families: ['Tree'] })
  await page.getByRole('button', { name: 'Search Other', exact: true }).click()
  await page.getByRole('button', { name: 'Resolve newest search', exact: true }).click()
  await expect(page.locator('.tree-node__content-label')).toHaveText(['Alpha', 'Other A'])
})

test.describe('native compact datetime', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })
  test('native cached time pane retains edited hours and minutes', async ({ page }) => {
    await open(page, 'datetime', '&utc=true')
    const field = page.getByTestId('datetime-full-field').locator('input')
    await expect(field).toHaveValue('06/15/2026 02:30 PM')
    await field.tap()
    const dialog = page.locator('.dialog__wrapper')
    await expect(dialog).toBeVisible()
    await dialog.locator('.dp-day').filter({ has: page.locator('.dayNo').getByText('16', { exact: true }) }).tap()
    const inputs = dialog.locator('.time-picker input')
    await dialog.getByRole('button', { name: 'AM', exact: true }).tap()
    await inputs.first().fill('10')
    await inputs.last().fill('45')
    await expect(page.getByTestId('datetime-full-value')).toHaveText('2026-06-16T10:45Z')
    await dialog.getByRole('tab', { name: 'Date', exact: true }).tap()
    await dialog.getByRole('tab', { name: 'Time', exact: true }).tap()
    await expect(inputs.first()).toHaveValue('10')
    await expect(inputs.last()).toHaveValue('45')
    await dialog.getByRole('button', { name: 'Apply', exact: true }).tap()
    await expect(dialog).toHaveCount(0)
    await expect(field).toHaveValue('06/16/2026 10:45 AM')
  })
})

test('native Tree initializes, filters and remounts without Suspense or interop', async ({ page }) => {
  await open(page, 'tree', '&mode=zero')
  await expect(page.locator('.tree-node__content-label')).toHaveText(['Match zero parent', 'Match zero child'])
  await open(page, 'tree', '&mode=sorted')
  const rows = page.locator('.tree-node__content')
  await expect(rows).toHaveText(['Alpha', 'Match A', 'Other A', 'Beta', 'Match B', 'Zulu'])
  await page.getByRole('button', { name: 'Search Other', exact: true }).click()
  await expect(rows).toHaveText(['Alpha', 'Other A'])
  await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
  await expect(rows).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
  await expect(rows).toHaveText(['Alpha', 'Other A'])
  await open(page, 'tree', '&mode=async')
  await expect(page.getByTestId('tree-initial-pending')).toBeVisible()
  await page.getByRole('button', { name: 'Search Other', exact: true }).click()
  await page.getByRole('button', { name: 'Resolve newest search', exact: true }).click()
  await expect(rows).toHaveText(['Alpha', 'Other A'])
  await page.getByRole('button', { name: 'Resolve oldest search', exact: true }).click()
  await expect(rows).toHaveText(['Alpha', 'Other A'])
})

test('native programmatic components preserve injection, update and dispose', async ({ page }) => {
  await open(page, 'dialog')
  await page.getByTestId('open-native-dialog').click()
  await expect(page.getByTestId('native-dialog-context')).toHaveText('Native owner context')
  await page.getByTestId('update-native-dialog').evaluate(el => el.click())
  await expect(page.getByTestId('native-dialog-context')).toHaveText('Updated native context')
  await page.getByTestId('hide-native-dialog').click()
  await expect(page.locator('.dialog__wrapper')).toHaveCount(0)
  await page.getByTestId('open-native-dialog').click()
  await page.getByTestId('unmount-native-app').evaluate(el => el.click())
  await expect(page.locator('.dialog__wrapper, .backdrop')).toHaveCount(0)
  await expect(page.locator('html')).toHaveAttribute('data-native-app', 'false')
  await expect(page.locator('html')).toHaveAttribute('data-listeners-disposed', 'true')
})

test('native Tabs cache state and confirmation restores keyboard focus', async ({ page }) => {
  await open(page, 'tabs')
  await page.getByRole('button', { name: 'Count alpha: 0', exact: true }).click()
  const nav = page.locator('.tabs-navigation')
  await nav.getByRole('tab', { name: 'Beta', exact: true }).click()
  await nav.getByRole('tab', { name: 'Alpha', exact: true }).click()
  await expect(page.getByTestId('panel-alpha')).toContainText('Count alpha: 1')
  for (const mode of ['individual', 'opt-out']) {
    await open(page, 'tabs', `&mode=${mode}`)
    await page.getByRole('button', { name: 'Count alpha: 0', exact: true }).click()
    await nav.getByRole('tab', { name: 'Beta', exact: true }).click()
    await page.getByRole('button', { name: 'Count beta: 0', exact: true }).click()
    await nav.getByRole('tab', { name: 'Alpha', exact: true }).click()
    await expect(page.getByTestId('panel-alpha')).toContainText('Count alpha: 1')
    await nav.getByRole('tab', { name: 'Beta', exact: true }).click()
    await expect(page.getByTestId('panel-beta')).toContainText('Count beta: 0')
  }
  await open(page, 'confirmation')
  await page.getByRole('button', { name: 'Open confirmation', exact: true }).click()
  await expect(page.locator('[data-cy="confirm-delete"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('confirmation-count')).toHaveText('1')
  await expect(page.locator('[data-cy="confirm-delete"]')).toHaveCount(0)
})

test('native Tabs use linked panels and full keyboard navigation without interop', async ({ page }) => {
  await open(page, 'tabs-keyboard')
  const group = page.getByTestId('keyboard-tabs')
  await group.getByRole('tab', { name: 'Alpha', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  const gamma = group.getByRole('tab', { name: 'Gamma', exact: true })
  await expect(gamma).toBeFocused()
  await expect(page.getByTestId('accessible-selection')).toHaveText('alpha')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('accessible-selection')).toHaveText('gamma')
  const id = await gamma.getAttribute('id')
  const panel = group.getByRole('tabpanel', { name: 'Gamma', exact: true })
  await expect(panel).toHaveAttribute('aria-labelledby', id)
  await page.keyboard.press('Tab')
  await expect(panel).toBeFocused()
  await gamma.focus()
  await page.keyboard.press('Delete')
  await expect(group.getByRole('tab', { name: 'Delta', exact: true })).toBeFocused()
  await expect(page.getByTestId('accessible-selection')).toHaveText('delta')
  await page.getByTestId('unmount-native-app').click()
  await expect(page.locator('[role="tablist"], [role="tabpanel"]')).toHaveCount(0)
})

test('native vertical scroller APIs measure, limit, clear and restore real rows', async ({ page }) => {
  await open(page, 'scroller-contracts')
  const scroller = page.getByTestId('vertical-contract')
  const button = name => page.getByRole('button', { name, exact: true })
  await button('Contract measure now').click()
  await expect(page.getByTestId('contract-measured')).toHaveText('108')
  await button('Contract scroll 60').click()
  await expect(scroller.locator('[data-index="60"]')).toBeVisible()
  await button('Contract viewport').click()
  await expect(scroller.locator('.content-row')).toHaveCount(5)
  await button('Contract clear').click()
  await expect(scroller.locator('.content-row')).toHaveCount(0)
  await button('Contract rerender').click()
  await expect(scroller.locator('[data-index="60"]')).toBeVisible()
  await button('Contract append').click()
  await button('Contract bottom').click()
  await expect(scroller.locator('[data-index="119"]')).toBeVisible()
  await page.getByTestId('unmount-native-app').click()
  await expect(page.locator('.virtual-scroll')).toHaveCount(0)
})

test('native Tree honors typed main-scroller configuration and custom raw item keys', async ({ page }) => {
  await open(page, 'scroller-contracts')
  const tree = page.getByTestId('typed-tree')
  await expect(tree.locator('.tree-node[data-id="0"]')).toHaveText('Typed node 0')
  const scroller = tree.locator('.virtual-scroll')
  await expect(scroller.locator('.content-row')).toHaveCount(5)
  await page.getByRole('button', { name: 'Tree change overscan', exact: true }).click()
  await expect.poll(() => scroller.locator('.content-row').count()).toBeGreaterThan(12)
  await scroller.evaluate(element => element.scrollTop = 36 * 60)
  await expect(tree.locator('.tree-node[data-id="60"]')).toHaveText('Typed node 60')
  await expect(scroller.locator('[data-index="60"]')).toHaveAttribute('data-key', '60')
})

test('native scrollers and movement expose DOM APIs and release gestures', async ({ page }) => {
  await open(page, 'scroller')
  await page.getByRole('button', { name: 'Set positions', exact: true }).click()
  await expect(page.getByTestId('horizontal-position')).toHaveText('140')
  await expect(page.getByTestId('vertical-position')).toHaveText('140')
  await page.getByTestId('horizontal').locator('.content').hover()
  await page.mouse.wheel(0, 50)
  await expect(page.getByTestId('horizontal-position')).toHaveText('190')
  await open(page, 'movement')
  const box = await page.getByTestId('move-handle').boundingBox()
  await page.mouse.move(box.x + 20, box.y + 20)
  await page.mouse.down()
  await expectSelectionDisabled(page)
  await page.mouse.move(box.x + 80, box.y + 60, { steps: 5 })
  await page.mouse.up()
  await expect.poll(async () => JSON.parse(await page.getByTestId('dimensions').textContent()).x).toBeGreaterThan(400)
  await page.getByTestId('unmount-native-app').click()
  await expectSelectionCleared(page)
})

test('native Table measurements preserve providers and remove temporary content', async ({ page }) => {
  await open(page, 'measurement')
  await expect(page.getByTestId('table-measurement')).toHaveAttribute('data-active', '2')
  await page.getByRole('button', { name: 'Measure concurrent cells', exact: true }).click()
  await expect(page.getByTestId('measurement-result')).toHaveAttribute('data-runs', '1')
  const result = JSON.parse(await page.getByTestId('measurement-result').textContent())
  expect(result.widths).toEqual([123, 287])
  expect(result.header).toBeGreaterThan(0)
  expect(result.plain).toBeGreaterThan(0)
  expect(result.boolean).toBeGreaterThan(0)
  await expect(page.locator('[data-table-measurement]')).toHaveCount(0)
})

test('native Table and Pivot synchronize scrollers and survive replacement', async ({ page }) => {
  await open(page, 'pivot')
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.pivot-loading')).toHaveCount(0)
  const options = page.getByTestId('table').getByRole('button', { name: 'Options for name', exact: true })
  await options.press('Enter')
  await expect(options).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.menu').last()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(options).toHaveAttribute('aria-expanded', 'false')
  for (let index = 0; index < 2; index++) {
    await page.locator('[data-testid="table"] .virtual-scroll').evaluate(el => el.scrollLeft = 150)
    await expect.poll(() => page.locator('.table-header .content').evaluate(el => el.scrollLeft)).toBe(150)
    await page.locator('.pivot-content__values').evaluate(el => el.scrollTop = 300)
    await expect.poll(() => page.locator('.pivot-content__rows').evaluate(el => el.scrollTop)).toBe(300)
    await page.getByRole('button', { name: 'Toggle tables', exact: true }).click()
    await expect(page.locator('.table, .pivot')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle tables', exact: true }).click()
    await expect(page.locator('.pivot-content')).toBeVisible()
  }
})

test('native Selector switches between mobile Dialog and desktop Menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, 'selector')
  for (const [width, label, code] of [[390, 'Alpha', 1], [1280, 'Beta', 2], [390, 'Alpha', 1]]) {
    await page.setViewportSize({ width, height: 844 })
    await page.getByTestId('nested-selector').locator('.control').click()
    const surface = page.locator(width === 390 ? '.dialog.selector-menu:visible' : '.menu.selector-menu:visible')
    await expect(surface).toBeVisible()
    await surface.getByText(`Choice ${label}`, { exact: true }).click()
    await expect(page.getByTestId('vapor-value')).toHaveText(new RegExp(`"code": ${code}`))
    await expect(page.getByTestId('nested-selector')).toContainText(label)
    await expect(surface).toHaveCount(0)
  }
})

test('native Selector and QueryBuilder render dynamic editors and clean up', async ({ page }) => {
  await open(page, 'selector')
  await page.getByTestId('nested-selector').locator('.control').click()
  await page.locator('.selector-menu:visible').getByText('Choice Alpha', { exact: true }).click()
  await expect(page.getByTestId('vapor-value')).toHaveText(/"code": 1/)
  await page.getByTestId('toggle-selector').click()
  await page.getByTestId('toggle-selector').click()
  await expect(page.getByTestId('nested-selector')).toContainText('Alpha')
  await open(page, 'query', '&small=true')
  await page.getByTestId('inline-builder').getByRole('button').last().click()
  await expect(page.locator('.qb-item-editor')).toBeVisible()
  await page.getByRole('button', { name: 'Toggle inline builder', exact: true }).evaluate(el => el.click())
  await expect(page.locator('.menu:visible')).toHaveCount(0)
})

test('native TreeDms accepts an external file and releases its owner', async ({ page }) => {
  await open(page, 'dms')
  const folder = page.locator('.tree-node[data-id="folder"]')
  await folder.evaluate(el => {
    const files = new DataTransfer()
    files.items.add(new File(['native'], 'native.txt', { type: 'text/plain' }))
    // Synthetic transfers need the OS file-entry boundary used by the handler.
    const original = DataTransferItem.prototype.webkitGetAsEntry
    DataTransferItem.prototype.webkitGetAsEntry = function () {
      const file = this.getAsFile()

      return { isFile: true, isDirectory: false, name: file.name, file: resolve => resolve(file) }
    }
    const box = el.getBoundingClientRect()
    const options = {
      bubbles: true,
      cancelable: true,
      dataTransfer: files,
      clientX: box.x + 25,
      clientY: box.y + 15,
    }
    try {
      el.dispatchEvent(new DragEvent('dragover', options))
      el.dispatchEvent(new DragEvent('drop', options))
    } finally {
      DataTransferItem.prototype.webkitGetAsEntry = original
    }
  })
  await expect(page.getByTestId('dms-items')).toContainText('native.txt')
  await page.getByTestId('unmount-native-app').click()
  await expect(page.locator('.tree, .ghost, .menu')).toHaveCount(0)
})

test('native Table edits a cell, cancels its next draft and remounts', async ({ page }) => {
  await open(page, 'edit')
  await expect(page.getByTestId('table-edit')).toHaveAttribute('data-ready', 'true')
  const cell = page.locator('.td[data-key="1"][data-field="name"]')
  await cell.dblclick()
  await cell.locator('input').fill('Native saved cell')
  await cell.locator('input').press('Control+Enter')
  await expect(page.getByTestId('edited-rows')).toContainText('Native saved cell')
  await expect(cell.locator('input')).toHaveCount(0)
  await cell.dblclick()
  await cell.locator('input').fill('Cancelled draft')
  await cell.locator('input').press('Escape')
  await expect(cell).toHaveText('Native saved cell')
  await page.getByRole('button', { name: 'Obnovit původní data', exact: true }).click()
  await expect(cell).toHaveText('Položka 1')
  await page.getByTestId('unmount-native-app').click()
  await expect(page.locator('.table, .table-cell-editor, .menu')).toHaveCount(0)
})

test('native Tree reports an external drop without moving its source node', async ({ page }) => {
  await open(page, 'drag', '&external=true')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  const source = await page.locator('.tree-node[data-id="node-1"]').boundingBox()
  const target = await page.getByTestId('external-tree-target').boundingBox()
  await page.mouse.move(source.x + 70, source.y + source.height / 2)
  await page.mouse.down()
  await page.mouse.move(target.x + 180, target.y + 50, { steps: 12 })
  await expect(page.locator('.ghost')).toHaveCount(1)
  await page.mouse.up()
  await expect.poll(async () => {
    const events = JSON.parse(await page.getByTestId('tree-outside-events').textContent())

    return events.filter(event => event.phase === 'drop').map(event => event.id)
  }).toEqual(['node-1'])
  await expect(page.getByTestId('tree-order')).toHaveText('node-1,node-2,node-3')
  await expect(page.getByTestId('tree-moves')).toHaveText('0')
  await expect(page.locator('.ghost')).toHaveCount(0)
})

test('native Tree commits a drag and disposes an active drag with its owner', async ({ page }) => {
  await open(page, 'drag', '&mode=parent&ids=numeric')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  const numericSource = await page.locator('.tree-node[data-id="1"]').boundingBox()
  const numericParent = await page.locator('.tree-node[data-id="0"]').boundingBox()
  await page.mouse.move(numericSource.x + 70, numericSource.y + numericSource.height / 2)
  await page.mouse.down()
  await page.mouse.move(numericParent.x + 100, numericParent.y + numericParent.height - 3, { steps: 12 })
  await page.mouse.up()
  await expect(page.getByTestId('tree-children')).toHaveText('1')
  await expect(page.getByTestId('tree-order')).toHaveText('0,2,3')
  await open(page, 'drag', '&mode=place')
  await expect(page.getByTestId('tree-drag')).toHaveAttribute('data-ready', 'true')
  async function drag(source) {
    const from = await page.locator(`.tree-node[data-id="${source}"]`).boundingBox()
    const to = await page.locator('.tree-node[data-id="node-3"]').boundingBox()
    await page.mouse.move(from.x + 70, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(to.x + 100, to.y + to.height - 3, { steps: 12 })
    await expect(page.locator('.ghost')).toHaveCount(1)
  }
  await drag('node-1')
  await page.mouse.up()
  await expect(page.getByTestId('tree-order')).toHaveText('node-2,node-3,node-1')
  await expect(page.getByTestId('tree-moves')).toHaveText('1')
  await drag('node-2')
  await page.getByTestId('unmount-native-app').evaluate(el => el.click())
  await page.mouse.up()
  await expect(page.locator('.tree, .ghost, .tree-drop-indicator')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveClass(/select-none/)
})
