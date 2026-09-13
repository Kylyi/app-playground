<script setup lang="ts">
const generation = ref(0)
</script>

<template>
  <main>
    <button
      data-example-control
      data-testid="remount"
      @click="generation++"
    >
      Remount
    </button>
    <div :key="generation">
      <VaporTableState
        label="saved"
        storage-key="LegacyTablePage"
      />
      <VaporTableState
        label="other"
        storage-key="OtherTablePage"
      />
      <VaporTableState label="local" />
      <VaporTableState
        label="disabled"
        :storage-key="null"
      />
    </div>
  </main>
</template>
