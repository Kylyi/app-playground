<script setup lang="ts" vapor>
const props = defineProps<{ report: (event: string) => void }>()
const ping = () => props.report('ping')
let listening = false
onMounted(() => {
  props.report('mounted')
  window.addEventListener('slot-lifecycle-ping', ping)
  listening = true
})
onBeforeUnmount(() => props.report('beforeUnmount'))
onUnmounted(() => props.report('unmounted'))
onScopeDispose(() => {
  // SSR also disposes setup scopes, but never installs the browser listener.
  if (listening) {
    props.report('disposed')
    window.removeEventListener('slot-lifecycle-ping', ping)
  }
})
</script>

<template>
  <span>Native child</span>
</template>
