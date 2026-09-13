<script setup lang="ts" vapor>
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'
import { PivotItem } from '../../../packages/UI/app/components/Pivot/models/pivot-item.model'
import VaporFocusEditor from './VaporFocusEditor.vue'

const ready = ref(false)
const rows = ref([{ id: 1, name: 'Alpha', custom: 'Bravo' }, { id: 2, name: 'Charlie', custom: 'Delta' }])
const columns = reactive([
  new TableColumn({ field: 'name', label: 'TextInput', width: '240px', dataType: 'string' }),
  new TableColumn({ field: 'custom', label: 'Vapor editor', width: '240px', dataType: 'string', editComponent: { component: markRaw(VaporFocusEditor) } }),
])
const items = [new PivotItem({ field: 'name', dataType: 'string', usage: { row: { index: 0 } } })]
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="table-focus"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <Table
      v-model:rows="rows"
      :columns
      editable
      :storage-key="null"
      :features="[]"
      :breakpoint="1"
      :split-rows="[]"
      :auto-fit="{ onInit: false }"
      :modifiers="{ useUrl: false, autoSaveSchema: false }"
      :ui="{ containerClass: ({ defaults }) => [defaults.all, 'w-600px min-h-180px'] }"
    />
    <Pivot
      :data="rows"
      :items
      :ui="{ containerStyle: () => ({ width: '600px', minHeight: '100px' }) }"
    />
  </section>
</template>
