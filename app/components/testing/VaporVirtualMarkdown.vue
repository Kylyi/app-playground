<script setup lang="ts" vapor>
import type { MarkdownDocument } from 'comark'
import AsyncMarkdownRow from './AsyncMarkdownRow.vue'

const slow = useRoute().query.slow === 'true'
const rows = ref(Array.from({ length: 200 }, (_, id) => ({
  id,
  document: undefined as MarkdownDocument | undefined,
})))
const scroller = useTemplateRef('scroller')
const narrow = ref(false)
const visibleStart = ref(0)
const loadedCount = computed(() => rows.value.filter(row => row.document).length)
</script>

<template>
  <section flex="~ col gap-4">
    <p>
      200 poznámek s různou délkou. Obsah se načítá při přiblížení do výřezu;
      hotové poznámky zůstávají v paměti. {{ slow ? 'Pomalé načítání: 0,9–3,1 s.' : 'Načítání: 0,3–1 s.' }}
    </p>
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        @click="narrow = !narrow"
      >
        Změnit šířku
      </button>
      <button
        data-example-control
        @click="scroller?.scrollToTop()"
      >
        Na začátek
      </button>
      <button
        data-example-control
        @click="scroller?.scrollTo(100)"
      >
        Na poznámku 101
      </button>
      <button
        data-example-control
        @click="scroller?.scrollToBottom()"
      >
        Na konec
      </button>
    </div>
    <p>
      Načteno: <output
        data-example-output
        aria-label="Markdown loaded"
        data-testid="markdown-loaded"
      >{{ loadedCount }}</output> / 200 ·
      První viditelná: {{ visibleStart + 1 }}
    </p>
    <VirtualScroller
      ref="scroller"
      data-testid="markdown-scroller"
      :rows
      :row-height="120"
      :initial-rows-render-count="6"
      :overscan="{ top: 240, bottom: 360 }"
      :ui="{ containerStyle: () => ({
        height: 'min(680px, 70vh)',
        width: narrow ? '380px' : '820px',
        maxWidth: '100%',
        border: '1px solid #94a3b8',
        borderRadius: '8px',
      }) }"
      @virtual-scroll="visibleStart = $event.visibleStartItem.index"
    >
      <template #default="{ row }">
        <AsyncMarkdownRow
          :id="row.id"
          v-model:document="row.document"
          :slow
        />
      </template>
    </VirtualScroller>
  </section>
</template>
