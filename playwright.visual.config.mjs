import { defineConfig } from '@playwright/test'
import mainConfig from './playwright.config.mjs'

const sizes = [
  { name: 'desktop', viewport: { width: 1280, height: 900 }, hasTouch: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, hasTouch: true },
]

export default defineConfig({
  ...mainConfig,
  testDir: './tests/visual',
  use: { ...mainConfig.use, trace: 'on', screenshot: 'on' },
  projects: mainConfig.projects.flatMap(project => sizes.flatMap(size => {
    return ['light', 'dark'].map(theme => ({
      name: `${project.name}-${size.name}-${theme}`,
      metadata: { browser: project.name, viewport: size.name, theme },
      use: {
        ...project.use,
        viewport: size.viewport,
        hasTouch: size.hasTouch,
        colorScheme: theme,
      },
    }))
  })),
})
