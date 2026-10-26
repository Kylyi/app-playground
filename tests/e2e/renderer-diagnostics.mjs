import process from 'node:process'
import { expect, test } from '@playwright/test'
import { captureState } from '../visual/capture-state.mjs'

export function observeRendererDiagnostics(page) {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    // Playwright's WebKit inspector injects its snapshot script into Nuxt
    // hints' intentionally script-free preview iframe. This is harness output,
    // identified by its inspector URL; application errors remain failures.
    if (
      message.location().url === 'web-inspector://bootstrap.js'
      && message.text() === "Blocked script execution in 'about:blank' because the document's frame is sandboxed and the 'allow-scripts' permission is not set."
    ) {
      return
    }

    // Match renderer messages, rather than a source URL containing "hydration".
    if (
      message.type() === 'error'
      || /^\[(?:Vue|Vapor) warn\]|^\[VUE_(?:VAPOR|HYDRATION|RUNTIME)/i.test(message.text())
      || /\[Vue warn\]: Hydration|Hydration [^\n]*(?:mismatch|completed|failed|aborted)/i.test(message.text())
      || /no active component|no.*Suspense.*boundary|outside of the render function/i.test(message.text())
    ) {
      problems.push(message.text())
    }
  })

  return problems
}

export function assertRendererDiagnostics(test) {
  const diagnostics = new WeakMap()
  test.beforeEach(async ({ page }) => {
    diagnostics.set(page, observeRendererDiagnostics(page))
  })
  test.afterEach(async ({ page }, testInfo) => {
    expect(diagnostics.get(page)).toEqual([])
    if (process.env.E2E_CAPTURE === '1' && testInfo.status === 'passed' && page.url() !== 'about:blank') {
      const content = page.locator('.playground-content')
      await captureState({
        page,
        testInfo,
        target: await content.count() ? content : page.locator('body'),
        state: 'functional-final',
        families: [],
      })
    }
  })
}

/** Secondary browser contexts must enforce the same diagnostics as the page fixture. */
export async function createObservedContext(browser, options) {
  const context = await browser.newContext(options)
  const { metadata, use } = test.info().project
  if (metadata.theme) {
    await context.addCookies([{ name: 'theme', value: metadata.theme, url: options?.baseURL ?? use.baseURL }])
  }
  const pages = new Map()
  context.on('page', page => pages.set(page, observeRendererDiagnostics(page)))
  const close = context.close.bind(context)
  context.close = async (...args) => {
    try {
      for (const problems of pages.values()) {
        expect(problems).toEqual([])
      }
      if (process.env.E2E_CAPTURE === '1' && options?.javaScriptEnabled !== false) {
        let index = 0
        for (const page of pages.keys()) {
          if (!page.isClosed() && page.url() !== 'about:blank') {
            const content = page.locator('.playground-content')
            await captureState({
              page,
              testInfo: test.info(),
              target: await content.count() ? content : page.locator('body'),
              state: `secondary-final-${++index}`,
              families: [],
            })
          }
        }
      }
    } finally {
      await close(...args)
    }
  }

  return context
}
