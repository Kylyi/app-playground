<script setup lang="ts" vapor>
import VdomLifecycleChild from './VdomLifecycleChild.vue'

const props = defineProps<{ report: (event: string) => void, mode: string }>()
const shown = ref(true)
defineExpose({ hide: () => shown.value = false, show: () => shown.value = true })
</script>

<template>
  <div>
    <!-- I01 removes a native element containing a VDOM component. -->
    <div v-if="mode === 'wrapped' && shown">
      <VdomLifecycleChild :report="props.report" />
    </div>
    <!-- Direct removal is the control; it already worked on rc.7. -->
    <VdomLifecycleChild
      v-else-if="mode === 'direct' && shown"
      :report="props.report"
    />
  </div>
</template>
