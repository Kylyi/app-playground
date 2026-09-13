<script setup lang="ts" vapor>
import type { ITableFetchPayload } from '../../../packages/UI/app/components/Table/types/table-fetch-payload.type'
import type { TableExpose } from '../../../packages/UI/app/components/Table/functions/table-get-exposed'
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'

const route = useRoute()
const table = useTemplateRef<TableExpose>('table')
const ready = ref(false)
const blocked = ref(false)
const expanded = ref(false)
const pending = ref(0)
const maxPending = ref(0)
const requests = ref<{ skip: number, last: number | null, search: string }[]>([])
const fullscreen = route.query.fullscreen === 'true'
const pageSize = fullscreen ? 20 : route.query.short ? 3 : 25
const columns = fullscreen
  ? Array.from({ length: 80 }, (_, index) => new TableColumn({
      field: index ? `field_${index}` : 'name',
      label: index ? `Column ${index}` : 'Name',
      width: '160px',
    }))
  : [new TableColumn({ field: 'name', label: 'Name', width: '480px' })]
const store = computed(() => table.value?.store())
const loadedIds = computed(() => store.value?.rows.value.map(row => row.id) ?? [])
const loadData = {
  payloadKey: 'data',
  onVirtualScroll: () => blocked.value ? false as const : undefined,
  fnc: async ({ tableData, fetchMore }: ITableFetchPayload) => {
    const { skip } = tableData.pagination
    const { search } = tableData
    requests.value.push({ skip, last: fetchMore?.lastRow?.id ?? null, search })
    pending.value++
    maxPending.value = Math.max(maxPending.value, pending.value)
    await new Promise(resolve => setTimeout(resolve, 250))
    pending.value--
    const count = search ? 12 : fullscreen ? 1000 : 83
    const base = search ? 1000 : 0

    return {
      count,
      data: Array.from({ length: Math.min(pageSize, count - skip) }, (_, index) => ({
        id: base + skip + index,
        name: `Item ${base + skip + index}`,
        ...Object.fromEntries(columns.slice(1).map(column => [column.field, `Item ${base + skip + index} ${column.field}`])),
      })),
    }
  },
}
function search() {
  if (store.value) {
    store.value.search.value = 'filtered'
  }
}
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="table-fetch-more"
    :data-ready="ready"
    :class="{ 'fullscreen-fixture': fullscreen }"
  >
    <div flex="~ gap-2 items-center wrap">
      <button
        data-example-control
        @click="blocked = !blocked"
      >
        Toggle fetch veto
      </button>
      <button
        data-example-control
        @click="expanded = !expanded"
      >
        Toggle row height
      </button>
      <button
        data-example-control
        @click="table?.getVirtualScroller()?.scrollToTop()"
      >
        Scroll to top
      </button>
      <button
        data-example-control
        @click="search"
      >
        Filter data
      </button>
      <button
        data-example-control
        @click="table?.refetch()"
      >
        Reload data
      </button>
      <span v-if="fullscreen">{{ loadedIds.length }} / 1000</span>
    </div>
    <output
      data-example-output
      aria-label="Loaded ids"
      :hidden="fullscreen"
      data-testid="loaded-ids"
    >{{ JSON.stringify(loadedIds) }}</output>
    <output
      data-example-output
      aria-label="Requests"
      :hidden="fullscreen"
      data-testid="requests"
    >{{ JSON.stringify(requests) }}</output>
    <output
      data-example-output
      aria-label="Pending"
      :hidden="fullscreen"
      data-testid="pending"
    >{{ pending }}</output>
    <output
      data-example-output
      aria-label="Max pending"
      :hidden="fullscreen"
      data-testid="max-pending"
    >{{ maxPending }}</output>
    <output
      data-example-output
      aria-label="Has more"
      :hidden="fullscreen"
      data-testid="has-more"
    >{{ store?.hasMore.value }}</output>
    <Table
      ref="table"
      :columns
      :load-data
      :storage-key="null"
      :features="[]"
      :breakpoint="1"
      :split-rows="[]"
      :auto-fit="{ onInit: false }"
      :pagination-config="{ enabled: false, pageSize }"
      :modifiers="{ useUrl: false, autoSaveSchema: false }"
      :scroller-config="{
        virtualizeColumns: fullscreen,
        rowHeight: 32,
        threshold: 10,
        overscan: { top: 64, bottom: 96 },
      }"
      :ui="{ containerClass: ({ defaults }) => [defaults.all, fullscreen ? 'min-h-0 w-full flex-1' : 'w-600px h-300px'] }"
    >
      <template #name="{ row }">
        <div :style="{ height: expanded && row.id % 5 === 0 ? '96px' : '32px' }">
          {{ row.name }}
        </div>
      </template>
    </Table>
  </section>
</template>

<style lang="scss" scoped>
.fullscreen-fixture {
  @apply fixed inset-0 z-100 flex flex-col bg-white dark:bg-black;

  > output[hidden] {
    display: none !important;
  }
}
</style>
