<script setup lang="ts" vapor>
const ready = ref(false)
const visible = ref(true)

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="status-primitives-example"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <button
      data-example-control
      type="button"
      @click="visible = !visible"
    >
      Toggle owner
    </button>

    <div
      v-if="visible"
      data-testid="status-primitives-owner"
      flex="~ col gap-4"
    >
      <PageWrapperLoading data-testid="status-page-loading" />
      <div
        relative
        h-24
      >
        <TableLoading data-testid="status-table-loading" />
      </div>
      <TableTooManyRowsInfo data-testid="status-too-many-rows" />
      <TableLayout data-testid="status-table-layout" />
      <TableRowGroup data-testid="status-table-row-group" />
      <TreeLoading data-testid="status-tree-loading" />
      <TreeNoData data-testid="status-tree-empty" />
    </div>
  </section>
</template>
