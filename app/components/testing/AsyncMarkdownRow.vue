<script setup lang="ts">
import type { MarkdownDocument as MarkdownDocumentType } from 'comark'
import { MarkdownDocument } from '@comark/vue'

const props = defineProps<{ id: number, slow: boolean }>()
const document = defineModel<MarkdownDocumentType>('document')
const collapsed = ref(false)
const pending = ref(false)
const failed = ref(false)
let controller: AbortController | undefined

async function load() {
  controller?.abort()
  const request = new AbortController()
  controller = request
  pending.value = true
  failed.value = false
  try {
    const result = await $fetch('/api/playground/markdown', {
      query: { id: props.id, slow: props.slow },
      signal: request.signal,
    })
    if (!request.signal.aborted) {
      document.value = result.document
    }
  } catch {
    if (!request.signal.aborted) {
      failed.value = true
    }
  } finally {
    if (!request.signal.aborted) {
      pending.value = false
    }
  }
}

onMounted(() => {
  if (!document.value) {
    load()
  }
})
onScopeDispose(() => controller?.abort())
</script>

<template>
  <article
    class="markdown-row"
    :data-note="id"
    :data-loaded="!!document"
    :aria-busy="pending"
  >
    <header flex="~ items-center justify-between gap-3">
      <strong>Poznámka {{ id + 1 }}</strong>
      <button
        v-if="document"
        data-example-control
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      >
        {{ collapsed ? 'Rozbalit' : 'Sbalit' }}
      </button>
    </header>
    <div
      v-if="document && !collapsed"
      class="markdown-body"
    >
      <Suspense>
        <MarkdownDocument :value="document" />
        <template #fallback>
          <p>Vykresluji Markdown…</p>
        </template>
      </Suspense>
    </div>
    <p v-else-if="!document">
      Náhled poznámky {{ id + 1 }}. {{ failed ? 'Načtení se nezdařilo.' : 'Čekám na obsah…' }}
    </p>
    <button
      v-if="failed"
      data-example-control
      @click="load"
    >
      Zkusit znovu
    </button>
  </article>
</template>

<style scoped lang="scss">
.markdown-row {
  @apply w-full min-w-0 p-5 border-b border-slate-200;
}

.markdown-body {
  @apply leading-7 break-words;

  :deep(h2) {
    @apply text-xl font-semibold my-3;
  }
  :deep(p) {
    @apply my-3;
  }
  :deep(ul) {
    @apply list-disc pl-6 my-3;
  }
  :deep(blockquote) {
    @apply border-l-3 border-blue-400 pl-4 my-3 text-slate-500;
  }
  :deep(pre) {
    @apply bg-slate-100 dark:bg-slate-800 p-3 rounded my-3 overflow-auto;
  }
  :deep(table) {
    @apply w-full my-3 border-collapse;
  }
  :deep(th),
  :deep(td) {
    @apply border border-slate-300 p-2 text-left;
  }
}
</style>
