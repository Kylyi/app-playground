<script setup lang="ts" vapor>
const element = useTemplateRef<HTMLDivElement>('element')
defineExpose({ element })
</script>

<template>
  <div ref="element">
    <slot />
  </div>
</template>
