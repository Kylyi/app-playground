<script setup lang="ts" vapor>
defineProps<{ alternate: boolean }>()

const element = useTemplateRef<HTMLButtonElement>('element')

defineExpose({ element })
</script>

<template>
  <div data-testid="target-wrapper">
    <button
      v-if="alternate"
      ref="element"
      data-example-control
      class="floating-test-target floating-test-target--alternate"
      data-testid="target-b"
    >
      Target B
    </button>

    <button
      v-else
      ref="element"
      data-example-control
      class="floating-test-target"
      data-testid="target-a"
    >
      Target A
    </button>
  </div>
</template>

<style scoped>
.floating-test-target--alternate {
  @apply m-l-60;
}
</style>
