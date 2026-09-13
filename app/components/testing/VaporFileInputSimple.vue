<script setup lang="ts" vapor>
const ready = ref(false)
const model = ref<FileModel[]>([])
const useScroller = ref(false)
const readonlyMode = ref(false)
const disabledMode = ref(false)
const visible = ref(true)
const focusedCount = ref(0)
const blurredCount = ref(0)

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="file-simple-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="useScroller = !useScroller"
      >
        Toggle scroller
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
        @click="visible = !visible"
      >
        Toggle input owner
      </button>
    </div>
    <FileInputSimple
      v-if="visible"
      v-model="model"
      data-testid="file-simple-field"
      :use-scroller
      :readonly="readonlyMode"
      :disabled="disabledMode"
      accept="text/plain"
      placeholder="Choose a file"
      no-download-button
      @focus="focusedCount++"
      @blur="blurredCount++"
    />
    <output
      data-example-output
      data-testid="file-simple-names"
    >{{ model.map(file => file.name).join(',') || 'empty' }}</output>
    <output
      data-example-output
      data-testid="file-simple-focus"
    >{{ focusedCount }}/{{ blurredCount }}</output>
  </section>
</template>
