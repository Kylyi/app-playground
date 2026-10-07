<script setup lang="ts" vapor>
import FallbackOwner from './FallbackOwner.vue'
import ForwardedFallbackOwner from './ForwardedFallbackOwner.vue'
import LifecycleChild from './LifecycleChild.vue'

const props = defineProps<{ report: (event: string) => void, mode: string }>()
const shown = ref(true)
defineExpose({ hide: () => shown.value = false, show: () => shown.value = true })
</script>

<template>
  <div>
    <div v-if="mode === 'static' && shown">
      <LifecycleChild :report="props.report" />
    </div>
    <FallbackOwner
      v-else-if="mode === 'direct-fallback' && shown"
      :report="props.report"
    />
    <ForwardedFallbackOwner
      v-else-if="mode === 'provided' && shown"
      :report="props.report"
    >
      <LifecycleChild :report="props.report" />
    </ForwardedFallbackOwner>
    <!-- An absent consumer slot reaches FallbackOwner as an empty forwarded slot. -->
    <ForwardedFallbackOwner
      v-else-if="mode === 'forwarded-fallback' && shown"
      :report="props.report"
    />
  </div>
</template>
