<script setup lang="ts" vapor>
const ready = ref(false)
const search = ref('')
const model = ref<string | null>(null)
const customSlots = ref(false)
const readonlyMode = ref(false)
const noSearch = ref(false)
const visible = ref(true)

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="icon-picker-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="customSlots = !customSlots"
      >
        Toggle slots
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
        @click="noSearch = !noSearch"
      >
        Toggle search
      </button>
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle owner
      </button>
    </div>
    <IconPicker
      v-if="visible"
      v-model="model"
      v-model:search="search"
      data-testid="icon-picker-field"
      :readonly="readonlyMode"
      :no-search
      :min-search-length="3"
      :search-input-props="{ placeholder: 'Search icons', debounce: 0 }"
    >
      <template
        v-if="customSlots"
        #search
      >
        <input
          v-model="search"
          data-testid="icon-custom-search"
          aria-label="Custom search"
        >
      </template>
      <template
        v-if="customSlots"
        #content
      >
        <p data-testid="icon-custom-content">
          Custom results for {{ search }}
        </p>
      </template>
    </IconPicker>
    <output
      data-example-output
      data-testid="icon-picker-value"
    >{{ model ?? 'empty' }}</output>
  </section>
</template>
