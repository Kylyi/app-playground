<script setup lang="ts" vapor>
import FallbackOwner from './FallbackOwner.vue'

const props = defineProps<{ report: (event: string) => void }>()
</script>

<template>
  <FallbackOwner :report="props.report">
    <slot />
  </FallbackOwner>
</template>
