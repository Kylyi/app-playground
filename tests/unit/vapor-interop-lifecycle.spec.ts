// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { createVaporApp, nextTick, vaporInteropPlugin } from 'vue'
import InteropLifecycleRoot from '../fixtures/interop-lifecycle/InteropLifecycleRoot.vue'

describe('interop child lifecycle under a Vapor owner', () => {
  for (const mode of ['wrapped', 'direct']) {
    it(`disposes ${mode} children on repeated removal and app unmount`, async () => {
      const container = document.createElement('div')
      document.body.append(container)
      const report = vi.fn()
      // Unlike the native slot suite, I01 deliberately exercises Vue's interop.
      const app = createVaporApp(InteropLifecycleRoot, { report: () => report, mode })
        .use(vaporInteropPlugin)
      let mounted = false
      try {
        const root = app.mount(container) as unknown as { hide: () => void, show: () => void }
        mounted = true
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(container.textContent).toBe('VDOM child')
          expect(report.mock.calls).toEqual([['mounted']])
          report.mockClear()
          window.dispatchEvent(new Event('interop-lifecycle-ping'))
          expect(report.mock.calls).toEqual([['ping']])
          report.mockClear()

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
          window.dispatchEvent(new Event('interop-lifecycle-ping'))
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
