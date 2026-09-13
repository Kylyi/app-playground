<script setup lang="ts" vapor>
const ready = ref(false)
const customAdd = ref(false)
const multi = ref(true)
const readonlyMode = ref(false)
const disabledMode = ref(false)
const dialogCount = ref(0)
const model = ref<IFile[]>([{ name: 'example.txt', type: 'text/plain', size: 4 }])

function removeFile(index: number | string) {
  model.value = model.value.toSpliced(Number(index), 1)
}

function openDialog() {
  dialogCount.value++
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="file-inner-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="customAdd = !customAdd"
      >
        Toggle add slot
      </button>
      <button
        data-example-control
        type="button"
        @click="multi = !multi"
      >
        Toggle multiple
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
    </div>
    <FileInputInner
      data-testid="file-inner-field"
      :model-value="model"
      :multi
      :readonly="readonlyMode"
      :disabled="disabledMode"
      :file-remove-fnc="removeFile"
      :open-file-dialog="openDialog"
      no-preview
      no-download-button
    >
      <template
        v-if="customAdd"
        #add
      >
        <button
          data-example-control
          type="button"
          @click.stop="openDialog"
        >
          Custom add
        </button>
      </template>
    </FileInputInner>
    <output
      data-example-output
      data-testid="file-inner-dialogs"
    >{{ dialogCount }}</output>
    <output
      data-example-output
      data-testid="file-inner-count"
    >{{ model.length }}</output>
  </section>
</template>
