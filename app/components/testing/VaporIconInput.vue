<script setup lang="ts" vapor>
const ready = ref(false)
const model = ref<string | null>('')
const visible = ref(true)
const readonlyMode = ref(false)
const clearCount = ref(0)
const input = ref<{
  focus: () => void
  select: () => void
  blur: () => void
  clear: () => void
  getInputElement: () => HTMLInputElement | undefined
}>()

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="icon-input-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="input?.focus()"
      >
        Focus input
      </button>
      <button
        data-example-control
        type="button"
        @click="input?.select()"
      >
        Select input
      </button>
      <button
        data-example-control
        type="button"
        @mousedown.prevent
        @click="input?.blur()"
      >
        Blur input
      </button>
      <button
        data-example-control
        type="button"
        @click="input?.clear()"
      >
        Clear input
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
        @click="visible = !visible"
      >
        Toggle owner
      </button>
      <button
        data-example-control
        type="button"
        @click="model = 'carbon:search'"
      >
        Replace model
      </button>
    </div>
    <IconInput
      v-if="visible"
      ref="input"
      v-model="model"
      data-testid="icon-input-field"
      :readonly="readonlyMode"
      :min-search-length="3"
      :debounce="0"
      empty-value=""
      clearable
      placeholder="Choose icon"
      @clear="clearCount++"
    />
    <output
      data-example-output
      data-testid="icon-input-value"
    >{{ model || 'empty' }}</output>
    <output
      data-example-output
      data-testid="icon-input-clears"
    >{{ clearCount }}</output>
  </section>
</template>
