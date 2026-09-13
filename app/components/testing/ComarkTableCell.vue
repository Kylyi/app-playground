<script setup lang="ts">
import { Markdown } from '@comark/vue'

defineProps<{ value: string }>()
</script>

<template>
  <div class="markdown-cell">
    <Suspense>
      <Markdown :value />
    </Suspense>
  </div>
</template>

<style scoped lang="scss">
.markdown-cell {
  @apply w-full min-w-0 whitespace-normal break-words leading-6 p-y-2;

  :deep(p) {
    @apply my-2;
  }
  :deep(ul) {
    @apply list-disc pl-5 my-2;
  }
  :deep(blockquote) {
    @apply border-l-3 border-blue-400 pl-3 my-2;
  }
  :deep(pre) {
    @apply bg-slate-100 dark:bg-slate-800 rounded p-2 my-2 overflow-auto;
  }
}
</style>
