<script setup lang="ts" vapor>
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'
import ComarkTableCell from './ComarkTableCell.vue'

const table = useTemplateRef('table')
const expanded = ref(false)
const ready = ref(false)
onMounted(() => ready.value = true)
const snippets = [
  'Krátký popis s **tučným textem** a *kurzívou*.',
  '**Kontrolní seznam**\n\n- Připravit podklady\n- Zkontrolovat data\n- Odeslat výsledek',
  '> Poznámka k implementaci\n\nDelší vysvětlení se přirozeně zalamuje podle šířky sloupce. Comark vykresluje přímo hodnotu buňky a řádek přebírá skutečnou výšku obsahu.',
  'Příklad konfigurace:\n\n```json\n{\n  "markdown": true,\n  "delay": 0\n}\n```',
]
const rows = computed(() => Array.from({ length: 200 }, (_, id) => ({
  id,
  name: `Záznam ${id + 1}`,
  description: snippets[id % snippets.length] + (expanded.value ? '\n\n**Doplnění:** Další odstavec v existující buňce mění výšku řádku bez opětovného načítání dat.' : ''),
  status: id % 2 ? 'Rozpracováno' : 'Hotovo',
})))
const columns = [
  new TableColumn({ field: 'name', label: 'Název', width: '160px' }),
  new TableColumn({ field: 'description', label: 'Popis · Markdown', width: '480px' }),
  new TableColumn({ field: 'status', label: 'Stav', width: '160px' }),
]
</script>

<template>
  <section
    flex="~ col gap-4"
    data-testid="table-markdown"
    :data-ready="ready"
  >
    <p>
      200 záznamů. Pouze sloupec Popis vykresluje hodnotu přes Comark, bez zpoždění a bez HTTP načítání.
      Šířku sloupce lze změnit tažením hlavičky.
    </p>
    <div flex="~ wrap gap-3">
      <button
        data-example-control
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Zkrátit popisy' : 'Rozšířit popisy' }}
      </button>
      <button
        data-example-control
        @click="table?.getVirtualScroller()?.scrollTo(100)"
      >
        Na záznam 101
      </button>
      <button
        data-example-control
        @click="table?.getVirtualScroller()?.scrollToTop()"
      >
        Na začátek
      </button>
    </div>
    <Table
      ref="table"
      :columns
      :rows
      :storage-key="null"
      :features="[]"
      :breakpoint="1"
      :split-rows="[]"
      :auto-fit="{ onInit: false }"
      :modifiers="{ useUrl: false, autoSaveSchema: false }"
      :scroller-config="{ rowHeight: 48, initialRowsRenderCount: 6, overscan: { top: 160, bottom: 240 } }"
      :ui="{ containerClass: ({ defaults }) => [defaults.all, 'w-full max-w-1000px h-600px'] }"
    >
      <template #description="{ value }">
        <ComarkTableCell :value="String(value ?? '')" />
      </template>
    </Table>
  </section>
</template>
