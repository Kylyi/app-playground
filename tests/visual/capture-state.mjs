import { writeFile } from 'node:fs/promises'
import { expect } from '@playwright/test'

/** Keep the visible viewport as well as the complete component surface. */
export async function captureState({ page, testInfo, target, state, families }) {
  await expect(target).toBeVisible()
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })

  const viewportPath = testInfo.outputPath(`${state}-viewport.png`)
  const componentPath = testInfo.outputPath(`${state}-component.png`)
  // Capture viewport first: element screenshots can scroll a long example.
  await page.screenshot({ path: viewportPath, animations: 'disabled', caret: 'hide' })
  await target.screenshot({ path: componentPath, animations: 'disabled', caret: 'hide' })
  const metadata = {
    ...testInfo.project.metadata,
    state,
    families,
    test: testInfo.title,
    project: testInfo.project.name,
    browser: testInfo.project.name.split('-')[0],
    theme: await page.locator('html').evaluate(element => element.classList.contains('dark') ? 'dark' : 'light'),
    viewportName: page.viewportSize()?.width < 768 ? 'mobile' : 'desktop',
    route: page.url(),
    viewport: page.viewportSize(),
    screenshots: { viewport: viewportPath, component: componentPath },
  }
  const metadataPath = testInfo.outputPath(`${state}-state.json`)
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2))
  await testInfo.attach(`${state}-viewport`, { path: viewportPath, contentType: 'image/png' })
  await testInfo.attach(`${state}-component`, { path: componentPath, contentType: 'image/png' })
  await testInfo.attach(`${state}-context`, { path: metadataPath, contentType: 'application/json' })

  return metadata
}
