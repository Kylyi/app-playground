// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { createVaporApp, nextTick } from 'vue'
import LifecycleRoot from '../fixtures/slot-lifecycle/LifecycleRoot.vue'

describe('native slot lifecycle', () => {
  for (const mode of ['static', 'direct-fallback', 'provided', 'forwarded-fallback']) {
    it(`disposes ${mode} children on repeated removal and app unmount`, async () => {
      const container = document.createElement('div')
      document.body.append(container)
      const report = vi.fn()
      // Native raw function props are getters; this returns the report callback.
      const app = createVaporApp(LifecycleRoot, { report: () => report, mode })
      let mounted = false
      try {
        const root = app.mount(container) as unknown as { hide: () => void, show: () => void }
        mounted = true
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(report.mock.calls).toEqual([['mounted']])
          report.mockClear()
          window.dispatchEvent(new Event('slot-lifecycle-ping'))
          expect(report.mock.calls).toEqual([['ping']])
          report.mockClear()

          // Last cycle destroys the owning app with its child still mounted.
          if (cycle === 2) {
            app.unmount()
            mounted = false
          } else {
            root.hide()
          }
          await nextTick()
          expect(container.textContent).toBe('')
          expect(report.mock.calls).toEqual([
            ['beforeUnmount'],
            ['disposed'],
            ['unmounted'],
          ])
          report.mockClear()
          window.dispatchEvent(new Event('slot-lifecycle-ping'))
          expect(report).not.toHaveBeenCalled()

          if (cycle < 2) {
            root.show()
            await nextTick()
          }
        }
      } finally {
        if (mounted) {
          app.unmount()
        }
        container.remove()
      }
    })
  }
})
