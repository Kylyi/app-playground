<script setup lang="ts">
// Intentionally VDOM: this fixture preserves I01's renderer boundary.
const props = defineProps<{ report: (event: string) => void }>()
const ping = () => props.report('ping')
let listening = false
onMounted(() => {
  props.report('mounted')
  window.addEventListener('interop-lifecycle-ping', ping)
  listening = true
})
onBeforeUnmount(() => props.report('beforeUnmount'))
onUnmounted(() => props.report('unmounted'))
onScopeDispose(() => {
  if (listening) {
    props.report('disposed')
    window.removeEventListener('interop-lifecycle-ping', ping)
  }
})
</script>

<template>
  <span>VDOM child</span>
</template>
