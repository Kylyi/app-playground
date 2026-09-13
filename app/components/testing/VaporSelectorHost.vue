<script setup lang="ts" vapor>
const value = ref(2)
const visible = ref(true)
const options = [{ code: 1, label: 'Alpha' }, { code: 2, label: 'Beta' }]
// Consumers may supply immutable lookup data; building options must not mutate it.
const initialMap = Object.freeze({ 2: { code: 2, label: 'Initial Beta' } })
</script>

<template>
  <section data-testid="vapor-selector-host">
    <button
      data-example-control
      data-testid="toggle-selector"
      @click="visible = !visible"
    >
      Toggle Selector
    </button>
    <output
      data-example-output
      aria-label="Vapor value"
      data-testid="vapor-value"
    >{{ value }}</output>
    <Selector
      v-if="visible"
      v-model="value"
      :options
      :initial-map
      option-key="code"
      label="Vapor parent selection"
      data-testid="nested-selector"
    >
      <template #option="{ item }">
        <span>Choice {{ item.label }}</span>
      </template>
    </Selector>
  </section>
</template>
