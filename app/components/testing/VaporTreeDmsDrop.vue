<script setup lang="ts" vapor>
const visible = ref(true)
const ready = ref(false)
const items = ref([{ id: 'folder', name: 'Documents', type: 'folder', children: [] as object[] }])
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="tree-dms-drop"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="visible = !visible"
    >
      Toggle DMS
    </button>
    <p>Přetáhni soubor do složky Documents nebo na prázdnou plochu stromu.</p>
    <output
      data-example-output
      aria-label="Dms items"
      data-testid="dms-items"
    >{{ JSON.stringify(items) }}</output>
    <TreeDms
      v-if="visible"
      v-model="items"
      file-key="file"
      folder-key="folder"
      :tree-props="{
        labelKey: 'name',
        dndConfig: { enabled: true, dropMode: 'parent' },
        searchConfig: { enabled: false },
        sortingConfig: { enabled: false },
        ui: { containerStyle: () => ({ width: '400px', height: '300px' }) },
      }"
      :drop-zone-config="{ enabled: true }"
    />
  </section>
</template>
