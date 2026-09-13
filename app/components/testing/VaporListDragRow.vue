<script setup lang="ts" vapor>
const alternateRoot = inject<Ref<boolean>>('list-drag-test-root')!
const element = useTemplateRef<HTMLElement>('element')
defineExpose({ element })
</script>

<template>
  <div
    v-if="!alternateRoot"
    ref="element"
  >
    <slot />
  </div>
  <section
    v-else
    ref="element"
  >
    <slot />
  </section>
</template>
