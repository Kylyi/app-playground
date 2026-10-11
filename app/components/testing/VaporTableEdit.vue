<script setup lang="ts" vapor>
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'
import type { ITableRowEdit } from '#layers/ui/app/components/Table/types/table-row-edit.type'

const props = defineProps<{ responsive?: boolean }>()
const route = useRoute()
const rowMode = route.query.mode === 'row-save'
const saveState = ref('idle')
const failSave = ref(false)
let pendingSave: (() => void) | undefined
const rowEdit: ITableRowEdit = {
  onSave: async ({ row }) => {
    saveState.value = 'pending'
    await new Promise<void>(resolve => pendingSave = resolve)
    pendingSave = undefined
    if (failSave.value) {
      saveState.value = 'failed'
      throw new Error('Save rejected')
    }

    saveState.value = 'saved'

    return row
  },
}
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
    <p v-if="rowMode">
      Edit row otevře draft celého řádku. Save row zahájí uložení; Resolve save dokončí čekající požadavek.
      Toggle save rejection zapne odmítnutí uložení pro ověření chyby a opakování.
    </p>
    <p v-else>
      Dvojklikem otevřete editor buňky. Enter uloží změnu a přejde dál, Ctrl/Cmd + Enter uloží a zavře editor.
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
      <template v-if="rowMode">
        <button
          data-example-control
          @click="pendingSave?.()"
        >
          Resolve save
        </button>
        <button
          data-example-control
          @click="failSave = !failSave"
        >
          Toggle save rejection
        </button>
        <output data-testid="row-save-state">{{ saveState }}</output>
      </template>
    </div>
    <Table
      :key="generation"
      v-model:rows="rows"
      :columns
      :editable="rowMode ? { mode: 'row' } : true"
      :row-edit="rowMode ? rowEdit : undefined"
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
    >
      <template
        v-if="rowMode"
        #row-actions="actions"
      >
        <button
          v-if="!actions.isEditing"
          data-example-control
          :data-row-edit="actions.row.id"
          :disabled="actions.disabled"
          @click="actions.edit()"
        >
          Edit row {{ actions.row.id }}
        </button>
        <template v-else>
          <button
            data-example-control
            :disabled="actions.isSaving"
            @click="actions.save()"
          >
            Save row
          </button>
          <button
            data-example-control
            :disabled="actions.isSaving"
            @click="actions.cancel()"
          >
            Cancel row
          </button>
          <output data-testid="row-save-error">{{ actions.error }}</output>
        </template>
      </template>
    </Table>
    <details>
      <summary>Aktuální data · prvních 5 řádků</summary>
      <pre
        data-testid="edited-rows"
        overflow="auto"
      >{{ JSON.stringify(rows.slice(0, 5), null, 2) }}</pre>
    </details>
  </section>
</template>
