export default defineEventHandler(() => {
  // These values arrive over HTTP and are intentionally outside Uno's client
  // scan. Runtime rendering must work without adding icon names to a safelist.
  return {
    mask: 'lucide:telescope',
    background: 'playground:runtime-color',
    custom: 'playground:runtime-mark',
    alias: 'nativeAlias',
    legacy: 'i-lucide-telescope',
    missing: 'lucide:playground-icon-does-not-exist',
    alternate: 'solar:planet-bold-duotone',
    slow: 'playground:runtime-slow',
    failed: 'playground:runtime-failed',
  }
})
