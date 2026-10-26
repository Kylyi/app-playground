import { createVaporApp, unref } from 'vue'
import { createPinia, disposePinia } from 'pinia'
import { applyPlugin, createNuxtApp } from '#app/nuxt'
import routerPlugin from '#native-router'
import i18nPlugin from '#native-i18n'
import devicePlugin from '#native-device'
import tooltipPlugin from '../../packages/UI/app/plugins/tooltip-host'
import floatingPlugin from '../../packages/UI/app/plugins/floating-ui-esc.client'
import pageSizePlugin from '../../packages/UI/app/plugins/page-size.client'
import { useUIStore } from '#imports'
import '#build/fetch'
import '#build/css'
// Nuxt normally injects this through its generated plugin entry.
import 'uno.css'
import NativeApp from './NativeApp.vue'

// Use the real framework services required by the Nuxt layers. The root has
// neither a VDOM app nor vaporInteropPlugin; native paths must work directly.
async function bootstrap() {
  const app = createVaporApp(NativeApp)
  const nuxtApp = createNuxtApp({ vueApp: app })
  const pinia = createPinia()
  app.use(pinia)
  nuxtApp.provide('pinia', pinia)
  await applyPlugin(nuxtApp, routerPlugin)
  await applyPlugin(nuxtApp, i18nPlugin)
  // This entry owns startup instead of Nuxt's generated locale/preload plugins.
  await nuxtApp.$i18n.loadLocaleMessages(unref(nuxtApp.$i18n.locale))
  await applyPlugin(nuxtApp, devicePlugin)
  await applyPlugin(nuxtApp, tooltipPlugin)
  await applyPlugin(nuxtApp, floatingPlugin)
  await applyPlugin(nuxtApp, pageSizePlugin)
  await nuxtApp.callHook('app:created', app)
  nuxtApp.isHydrating = false
  await nuxtApp.callHook('app:beforeMount', app)
  // Mount directly so component injection resolves through its local owner.
  // An enclosing runWithContext would prefer global app providers instead.
  app.mount('#__nuxt')
  await nuxtApp.callHook('app:mounted', app)

  document.documentElement.dataset.nativeApp = 'true'
  document.documentElement.dataset.interop = String(Boolean(app._context.vapor))
  const uiStore = nuxtApp.runWithContext(() => useUIStore())
  document.querySelector('[data-testid="unmount-native-app"]').addEventListener('click', () => {
    app.unmount()
    disposePinia(pinia)
    nuxtApp._scope.stop()
    const previous = uiStore.lastPointerDownEvent
    document.documentElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    document.documentElement.dataset.listenersDisposed = String(uiStore.lastPointerDownEvent === previous)
    document.documentElement.dataset.nativeApp = 'false'
  })
}

void bootstrap().catch(error => {
  console.error(error)
  document.documentElement.dataset.nativeApp = 'failed'
})
