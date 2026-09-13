<script setup lang="ts" vapor>
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'

const props = defineProps<{ responsive?: boolean }>()
const route = useRoute()
const ready = ref(false)
const generation = ref(0)
const count = computed(() => route.query.virtual === 'true' ? 1000 : 5)
const rows = ref(createRows())
const columns = [
  new TableColumn({ field: 'id', label: 'ID · pouze čtení', width: '150px', dataType: 'number', noEdit: true }),
  new TableColumn({ field: 'name', label: 'Název', width: '280px', dataType: 'string' }),
  new TableColumn({ field: 'quantity', label: 'Počet', width: '160px', dataType: 'number' }),
  new TableColumn({ field: 'active', label: 'Aktivní', width: '160px', dataType: 'boolean' }),
]

function createRows() {
  return Array.from({ length: count.value }, (_, index) => ({
    id: index + 1,
    name: `Položka ${index + 1}`,
    quantity: index + 10,
    active: index % 2 === 0,
  }))
}

function reset() {
  rows.value = createRows()
  generation.value++
}

watch(count, reset)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="table-edit"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <p>
      Kliknutím otevřete editor buňky. Enter uloží změnu a přejde dál, Ctrl/Cmd + Enter uloží a zavře editor.
      Escape změnu zruší. Data jsou pouze v paměti této ukázky.
    </p>
    <p v-if="props.responsive">
      Podle šířky tabulky: pod 560 px jedna karta na řádek, od 560 do 959 px dvě karty vedle sebe,
      od 960 px klasická tabulka. V kartě otevřete editor tužkou u názvu pole.
    </p>
    <div flex="~ items-center gap-3">
      <Btn
        outlined
        label="Obnovit původní data"
        @click="reset"
      />
      <span>{{ count }} řádků</span>
    </div>
    <Table
      :key="generation"
      v-model:rows="rows"
      :columns
      editable
      :storage-key="null"
      :features="[]"
      :breakpoint="props.responsive ? 960 : 1"
      :split-rows="props.responsive ? [{ breakpoint: 560, count: 2 }, { breakpoint: 960, count: 1 }] : []"
      :auto-fit="{ onInit: false }"
      :modifiers="{ useUrl: false, autoSaveSchema: false }"
      :ui="{
        containerClass: ({ defaults }) => [
          defaults.all,
          'w-full h-420px',
          props.responsive && route.query.small === 'true' ? 'max-w-390px' : 'max-w-1000px',
        ],
      }"
    />
    <details>
      <summary>Aktuální data · prvních 5 řádků</summary>
      <pre
        data-testid="edited-rows"
        overflow="auto"
      >{{ JSON.stringify(rows.slice(0, 5), null, 2) }}</pre>
    </details>
  </section>
</template>
