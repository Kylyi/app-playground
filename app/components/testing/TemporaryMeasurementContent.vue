<script setup lang="ts" vapor>
import type { Ref } from 'vue'

const props = defineProps<{ width: number }>()
const context = inject<{
  offset: Ref<number>
  active: Ref<number>
  measurementActive?: Ref<number>
}>('table-measurement-context')!
const width = computed(() => props.width + context.offset.value)
const element = useTemplateRef<HTMLElement>('element')
let isMeasurement = false
onMounted(() => {
  context.active.value++
  isMeasurement = !!element.value?.closest('[data-table-measurement]')
  if (isMeasurement && context.measurementActive) {
    context.measurementActive.value++
  }
})
onUnmounted(() => {
  context.active.value--
  if (isMeasurement && context.measurementActive) {
    context.measurementActive.value--
  }
})
</script>

<template>
  <div
    ref="element"
    data-measured-content
    :style="{ width: `${width}px`, flexShrink: 0 }"
  >
    Measured content
  </div>
</template>
