<script setup lang="ts" vapor>
import { ComparatorEnum } from '$comparatorEnum'
import type { IQueryBuilderRow } from '../../../packages/UI/app/components/QueryBuilder/types/query-builder-row-props.type'

const small = useRoute().query.small === 'true'
const mounted = ref(true)
const scrollPreview = ref(false)
const ready = ref(false)
const inlineMounted = ref(true)
const inlineItems = ref<IQueryBuilderRow[]>([{
  id: 'inline-root',
  isGroup: true,
  condition: 'AND',
  path: '0',
  children: [],
}])
const columns = [new TableColumn({ field: 'name', label: 'Name', dataType: 'string' })]
function createConditions(names: string[]): IQueryBuilderRow[] {
  return names.map(value => ({
    id: value,
    path: '',
    field: 'name',
    comparator: ComparatorEnum.EQUAL,
    value,
  }))
}

const rootChildren = createConditions([
  'Alpha',
  'Beta',
  'Gamma',
  ...(!small ? Array.from({ length: 9 }, (_, index) => `Item ${index + 4}`) : []),
])
if (!small) {
  rootChildren.push({
    id: 'platform',
    isGroup: true,
    condition: 'AND',
    path: '',
    children: [
      ...createConditions(['Web', 'Mobile', 'Desktop', 'API']),
      {
        id: 'security',
        isGroup: true,
        condition: 'OR',
        path: '',
        children: createConditions(['Login', 'Roles', 'Sessions', 'Audit']),
      },
    ],
  }, {
    id: 'billing',
    isGroup: true,
    condition: 'OR',
    path: '',
    children: createConditions(['Invoice', 'Payment', 'Currency', 'Tax']),
  })
}

function assignPaths(rows: IQueryBuilderRow[], prefix = '') {
  rows.forEach((row, index) => {
    row.path = `${prefix}${index}`
    if ('children' in row) {
      assignPaths(row.children, `${row.path}.children.`)
    }
  })
}

const initialItems: IQueryBuilderRow[] = [{
  id: 'root',
  isGroup: true,
  condition: 'AND',
  path: '0',
  children: rootChildren,
}]
assignPaths(initialItems)
const items = ref(initialItems)
const order = computed(() => {
  const root = items.value[0]

  return root && 'children' in root ? root.children.map(item => item.id).join(',') : ''
})
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="query-builder-dom"
    :data-ready="ready"
  >
    <p>{{ small ? '3 podmínky' : '24 podmínek ve 4 skupinách, vnoření do 3 úrovní' }}</p>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle query builder
    </button>
    <output
      data-example-output
      aria-label="Query order"
      data-testid="query-order"
    >{{ order }}</output>
    <details>
      <summary>Struktura dat</summary>
      <pre data-testid="query-structure">{{ JSON.stringify(items, null, 2) }}</pre>
    </details>
    <button
      data-example-control
      @click="inlineMounted = !inlineMounted"
    >
      Toggle inline builder
    </button>
    <div data-testid="inline-builder">
      <QueryBuilderInline
        v-if="inlineMounted"
        v-model:items="inlineItems"
        :columns
        editable
      />
    </div>
    <button
      data-example-control
      @click="scrollPreview = !scrollPreview"
    >
      Toggle scroll viewport
    </button>
    <div :class="{ 'scroll-preview': scrollPreview }">
      <QueryBuilder
        v-if="mounted"
        v-model:items="items"
        :columns
        editable
        class="max-h-150"
      />
    </div>
  </section>
</template>

<style scoped>
.scroll-preview {
  width: 400px;
}

.scroll-preview :deep(.query-builder) {
  height: 160px;
}

.scroll-preview :deep(.query-builder > .qb-group) {
  min-width: 720px;
}
</style>
