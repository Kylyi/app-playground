<script setup lang="ts" vapor>
const ready = ref(false)
const file = ref<IFile>({ name: 'Remote image', path: '/testing/preview.svg', type: 'image/svg+xml' })
const actionsVisible = ref(true)
const editable = ref(true)
const visible = ref(true)
const removed = ref(0)

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="string-preview-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="file = { name: 'changed.txt', path: 'changed.txt', type: 'text/plain' }"
      >
        Change file
      </button>
      <button
        data-example-control
        type="button"
        @click="actionsVisible = !actionsVisible"
      >
        Toggle actions
      </button>
      <button
        data-example-control
        type="button"
        @click="editable = !editable"
      >
        Toggle editable
      </button>
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle owner
      </button>
    </div>
    <FileStringPreview
      v-if="visible"
      data-testid="string-preview"
      :file
      :editable
      :actions="actionsVisible ? undefined : { remove: false, download: false }"
      download-url="/vapor-chip-example.txt"
      @remove="removed++"
    />
    <output
      data-example-output
      data-testid="string-preview-removed"
    >{{ removed }}</output>
  </section>
</template>
