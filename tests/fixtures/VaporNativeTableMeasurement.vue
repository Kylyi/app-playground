<script setup lang="ts" vapor>
import { TableColumn } from '../../packages/UI/app/components/Table/models/table-column.model'
import { useRenderTemporaryTableCell } from '../../packages/UI/app/components/Table/composables/useRenderTemporaryTableCell'
import TableMeasurement from '../../packages/UI/app/components/Table/TableMeasurement.vue'
import TemporaryMeasurementContent from '../../app/components/testing/TemporaryMeasurementContent.vue'

const measurements = useRenderTemporaryTableCell()
const { requests } = measurements
const offset = ref(50)
const active = ref(0)
const col = new TableColumn({ field: 'width', label: 'Native width' })
provide('table-measurement-context', { offset, active })
defineExpose({ measurements, col, active })
</script>

<template>
  <div>
    <TableMeasurement
      v-for="request in requests"
      :key="request.id"
      :request
      @ready="element => measurements.setElement(request.id, element)"
    >
      <template #default="{ row }">
        <TemporaryMeasurementContent :width="row.width" />
      </template>
    </TableMeasurement>
  </div>
</template>
