<script setup lang="ts" vapor>
const ready = ref(false)
const file = ref<IFile>({ name: 'example.txt', path: 'example.txt', size: 4, type: 'text/plain' })
const readonlyMode = ref(false)
const disabledMode = ref(false)
const noDownload = ref(false)
const removedCount = ref(0)
const parentClicks = ref(0)

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="file-chip-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="file = { ...file, name: 'changed.txt', size: 2048 }"
      >
        Change file
      </button>
      <button
        data-example-control
        type="button"
        @click="readonlyMode = !readonlyMode"
      >
        Toggle readonly
      </button>
      <button
        data-example-control
        type="button"
        @click="disabledMode = !disabledMode"
      >
        Toggle disabled
      </button>
      <button
        data-example-control
        type="button"
        @click="noDownload = !noDownload"
      >
        Toggle download
      </button>
    </div>
    <div
      data-testid="file-chip-parent"
      @click="parentClicks++"
    >
      <FileChip
        data-testid="file-chip"
        :chip="file"
        :readonly="readonlyMode"
        :disabled="disabledMode"
        :no-download-button="noDownload"
        download-url="/vapor-chip-example.txt"
        @remove="removedCount++"
      />
    </div>
    <output
      data-example-output
      data-testid="file-chip-events"
    >{{ removedCount }}/{{ parentClicks }}</output>
  </section>
</template>
