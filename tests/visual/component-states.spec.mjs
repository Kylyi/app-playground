import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics } from '../e2e/renderer-diagnostics.mjs'
import { captureState } from './capture-state.mjs'
import { expectTextContrast } from '../e2e/text-contrast.mjs'
import { expectCircleFixtureLayout } from '../e2e/presentation-geometry.mjs'

assertRendererDiagnostics(test)

test.beforeEach(async ({ context, baseURL }, testInfo) => {
  await context.addCookies([{ name: 'theme', value: testInfo.project.metadata.theme, url: baseURL }])
})

test.afterEach(async ({ page }, testInfo) => {
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${testInfo.project.metadata.theme}\\b`))
})

async function open(page, path, testId) {
  // Nuxt prefetches its build manifest after app startup. Finish that real
  // request before a later full document reload can abort it in WebKit.
  const [response, manifest] = await Promise.all([
    page.goto(`/cs-CZ/${path}`),
    page.waitForResponse(response => response.url().includes('/builds/meta/')),
  ])
  expect(response.status()).toBe(200)
  expect(manifest.ok()).toBe(true)
  expect(await manifest.finished()).toBeNull()
  const target = page.getByTestId(testId)
  await expect(target).toHaveAttribute('data-ready', 'true')

  return target
}

test('presentation surfaces preserve layout through expanded and loading states', async ({ page }, testInfo) => {
  const target = await open(page, 'vapor-presentation-primitives', 'presentation-primitives-example')
  const families = [
    'Banner',
    'Breadcrumbs',
    'CircleProgress',
    'Collapse',
    'Field',
    'Loader',
    'MainBar',
    'Navigation',
    'Page',
    'ProgressBar',
    'Section',
    'Separator',
    'Skeleton',
    'Typography',
    'ValueFormatter',
  ]
  await expectCircleFixtureLayout(page.getByTestId('presentation-circle'))
  await captureState({ page, testInfo, target, families, state: 'presentation-default' })
  await expect(page.getByTestId('formatter-empty-case')).toHaveText(['Empty', 'Empty', 'Empty', 'Empty', '0', 'false'])
  await expect(page.getByTestId('formatter-custom-empty')).toHaveText('Empty')
  await page.getByTestId('presentation-collapse').locator('.collapse__header').click()
  await expect(page.getByTestId('collapse-content')).toBeVisible()
  await page.getByRole('button', { name: 'Change progress', exact: true }).click()
  await expect(page.getByTestId('presentation-progress')).toContainText('Loaded 70%')
  await expectCircleFixtureLayout(page.getByTestId('presentation-circle'))
  await page.getByRole('button', { name: 'Toggle section heading tag', exact: true }).click()
  await expect(page.getByTestId('presentation-section').locator('h2.section__title')).toHaveText('Presentation section')
  await captureState({ page, testInfo, target, families, state: 'presentation-expanded' })
  await page.getByRole('button', { name: 'Toggle section loading', exact: true }).click()
  await expect(page.getByTestId('presentation-section').locator('.skeleton')).toBeVisible()
  await page.getByRole('button', { name: 'Toggle separator', exact: true }).click()
  await page.getByLabel('Loader variant', { exact: true }).selectOption('inline')
  await captureState({ page, testInfo, target, families, state: 'presentation-loading' })
})

test('controls expose unchecked, indeterminate, checked and confirmation states', async ({ page }, testInfo) => {
  const target = await open(page, 'vapor-control-primitives', 'control-primitives-example')
  const families = ['Checkbox', 'Toggle', 'Confirmation', 'Marquee', 'Movement', 'QueryBuilder']
  await captureState({ page, testInfo, target, families, state: 'controls-default' })
  await page.getByTestId('state-checkbox').click()
  await page.getByTestId('state-toggle').click()
  await expect(page.getByTestId('state-checkbox').locator('input')).toHaveJSProperty('indeterminate', true)
  await expect(page.getByTestId('state-toggle')).toHaveClass(/(?:^|\s)is-indeterminate(?:\s|$)/)
  await captureState({ page, testInfo, target, families, state: 'controls-indeterminate' })
  await page.getByTestId('state-checkbox').press('Space')
  await page.getByTestId('state-toggle').press('Enter')
  await page.getByRole('button', { name: 'Open confirmation', exact: true }).click()
  await expect(page.getByTestId('confirmation-content')).toBeVisible()
  const close = page.getByRole('button', { name: 'Zavřít', exact: true })
  await expect(close).toHaveCSS('opacity', '1')
  await expectTextContrast(close, { foreground: '.btn-label', backgrounds: [':scope'] })
  await captureState({ page, testInfo, target, families, state: 'controls-confirmation' })
  await page.getByRole('button', { name: 'Clear string toggle', exact: true }).click()
  await expect(page.getByTestId('string-toggle')).toHaveAttribute('aria-checked', 'mixed')
  await captureState({ page, testInfo, target, families, state: 'controls-string-cleared' })
})

test('leaf surfaces retain active and readonly appearances', async ({ page }, testInfo) => {
  const target = await open(page, 'vapor-leaf-primitives', 'leaf-primitives-example')
  const families = ['Badge', 'Burger', 'ButtonGroup', 'Item', 'KeyboardShortcut', 'Movement', 'Radio']
  await captureState({ page, testInfo, target, families, state: 'leaf-default' })
  await page.getByTestId('leaf-burger').click()
  await page.getByRole('button', { name: 'Right option', exact: true }).click()
  await page.getByTestId('leaf-radio-second').click()
  await expect(page.getByTestId('burger-value')).toHaveText('true')
  await expect(page.getByTestId('radio-value')).toHaveText('second')
  await captureState({ page, testInfo, target, families, state: 'leaf-active' })
})

test('cached Tabs paint active content and retain a changed panel', async ({ page }, testInfo) => {
  const target = await open(page, 'vapor-tabs', 'tabs-example')
  const families = ['Tabs', 'Button', 'Scroller']
  await captureState({ page, testInfo, target, families, state: 'tabs-alpha' })
  await page.getByRole('button', { name: 'Count alpha: 0', exact: true }).click()
  await page.locator('.tabs-navigation').getByRole('tab', { name: 'Beta', exact: true }).click()
  await expect(page.getByTestId('panel-beta')).toBeVisible()
  await captureState({ page, testInfo, target, families, state: 'tabs-beta' })
  await page.locator('.tabs-navigation').getByRole('tab', { name: 'Alpha', exact: true }).click()
  await expect(page.getByTestId('panel-alpha')).toContainText('Count alpha: 1')
  await captureState({ page, testInfo, target, families, state: 'tabs-cached-alpha' })
  for (const mode of ['individual', 'opt-out']) {
    const current = await open(page, `vapor-tabs?mode=${mode}`, 'tabs-example')
    await page.getByRole('button', { name: 'Count alpha: 0', exact: true }).click()
    await page.locator('.tabs-navigation').getByRole('tab', { name: 'Beta', exact: true }).click()
    await page.locator('.tabs-navigation').getByRole('tab', { name: 'Alpha', exact: true }).click()
    await expect(page.getByTestId('panel-alpha')).toContainText('Count alpha: 1')
    await captureState({ page, testInfo, target: current, families, state: `tabs-${mode}` })
  }
  const evicted = await open(page, 'vapor-tabs', 'tabs-example')
  await page.getByRole('button', { name: 'Count alpha: 0', exact: true }).click()
  for (const name of ['Beta', 'Gamma', 'Alpha']) {
    await page.locator('.tabs-navigation').getByRole('tab', { name, exact: true }).click()
  }
  await expect(page.getByTestId('panel-alpha')).toContainText('Count alpha: 0')
  await captureState({ page, testInfo, target: evicted, families, state: 'tabs-max-evicted' })
})

test('Tree paints sorted, empty, pending and numeric-ID states', async ({ page }, testInfo) => {
  const families = ['Tree', 'VirtualScroller', 'Inputs']
  let target = await open(page, 'vapor-tree-initialization?mode=sorted', 'tree-initialization')
  await expect(page.locator('.tree-node__content')).toHaveText(['Alpha', 'Match A', 'Other A', 'Beta', 'Match B', 'Zulu'])
  await captureState({ page, testInfo, target, families, state: 'tree-sorted' })
  await page.getByRole('button', { name: 'Search Missing', exact: true }).click()
  await expect(page.getByTestId('tree-initial-empty')).toBeVisible()
  await captureState({ page, testInfo, target, families, state: 'tree-empty' })
  target = await open(page, 'vapor-tree-initialization?mode=async', 'tree-initialization')
  await expect(page.getByTestId('tree-initial-pending')).toBeVisible()
  await captureState({ page, testInfo, target, families, state: 'tree-pending' })
  await page.getByRole('button', { name: 'Resolve newest search', exact: true }).click()
  await expect(page.locator('.tree-node__content')).toHaveText(['Alpha', 'Match A', 'Beta', 'Match B'])
  await captureState({ page, testInfo, target, families, state: 'tree-resolved' })
  target = await open(page, 'vapor-tree-initialization?mode=zero', 'tree-initialization')
  await expect(page.locator('.tree-node__content-label')).toHaveText(['Match zero parent', 'Match zero child'])
  await captureState({ page, testInfo, target, families, state: 'tree-zero-id' })
})
