<script setup lang="ts" vapor>
import LifecycleChild from './LifecycleChild.vue'

const props = defineProps<{ report: (event: string) => void }>()
</script>

<template>
  <div>
    <slot>
      <LifecycleChild :report="props.report" />
    </slot>
  </div>
</template>
