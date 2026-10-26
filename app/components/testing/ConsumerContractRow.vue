<script setup lang="ts" vapor>
const element = useTemplateRef('element')
useValidationQueue({ consumerRows: () => element.value?.querySelector('button')?.focus() })
defineExpose({ element })
</script>

<template>
  <article
    ref="element"
    data-consumer-row
  >
    <slot />
  </article>
</template>
