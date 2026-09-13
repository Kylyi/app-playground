<script setup lang="ts" vapor>
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'
import { useRenderTemporaryTableCell } from '../../../packages/UI/app/components/Table/composables/useRenderTemporaryTableCell'
import TemporaryMeasurementContent, { measurementSlot } from './TemporaryMeasurementContent.vue'

const { getCellWidth, getHeaderWidth } = useRenderTemporaryTableCell()
const { setTempComponent } = useUIStore()
const col = new TableColumn({ field: 'width', label: 'Measured column', dataType: 'number' })
const ready = ref(false)
const result = ref('pending')
const runs = ref(0)
const ssrHandle = import.meta.server ? setTempComponent(TemporaryMeasurementContent) : undefined
ssrHandle?.()
onMounted(() => ready.value = true)

async function measure() {
  try {
    const widths = await Promise.all([123, 287].map(width => getCellWidth({
      row: { width },
      col,
      slotRenderFnc: measurementSlot,
    })))
    const header = await getHeaderWidth(col)
    const plain = await getCellWidth({ row: { width: 42 }, col })
    const boolean = await getCellWidth({
      row: { enabled: true },
      col: new TableColumn({ field: 'enabled', dataType: 'boolean' }),
    })
    const temporary = setTempComponent(TemporaryMeasurementContent)
    temporary()
    temporary()
    result.value = JSON.stringify({ widths, header, plain, boolean })
  } catch (error) {
    result.value = error instanceof Error ? error.message : String(error)
  } finally {
    runs.value++
  }
}
</script>

<template>
  <section
    data-testid="table-measurement"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <button
      data-example-control
      type="button"
      @click="measure"
    >
      Measure concurrent cells
    </button>
    <output
      data-example-output
      aria-label="Measurement result"
      data-testid="measurement-result"
      :data-runs="runs"
    >{{ result }}</output>
  </section>
</template>
