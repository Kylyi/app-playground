<script setup lang="ts">
const value = ref<number | null>()
const search = ref('')
const changes = ref(0)
const selector = useTemplateRef('selector')
const ready = ref(false)
const options = [{ id: 1, label: 'Alpha' }, { id: 2, label: 'Beta' }, { id: 3, label: 'Gamma' }]
onMounted(() => ready.value = true)
</script>

<template>
  <main
    :data-ready="ready"
    data-testid="selector-fixture"
    p="8"
  >
    <h1>Selector model contract</h1>
    <button
      data-example-control
      data-testid="set-parent"
      @click="value = 2"
    >
      Parent selects Beta
    </button>
    <button
      data-example-control
      data-testid="set-null"
      @click="value = null"
    >
      Parent clears to null
    </button>
    <button
      data-example-control
      data-testid="set-undefined"
      @click="value = undefined"
    >
      Parent clears to undefined
    </button>
    <button
      data-example-control
      data-testid="clear-exposed"
      @click="selector?.clear()"
    >
      Clear through API
    </button>
    <output
      data-example-output
      aria-label="Value"
      data-testid="value"
    >{{ value === undefined ? 'undefined' : JSON.stringify(value) }}</output>
    <output
      data-example-output
      aria-label="Changes"
      data-testid="changes"
    >{{ changes }}</output>
    <output
      data-example-output
      aria-label="Search"
      data-testid="search"
    >{{ search }}</output>

    <div style="padding: 10px; border: 1px solid #000;">
      {{ value }}
    </div>

    <Selector
      ref="selector"
      v-model:search="search"
      v-model="value"
      :options
      label="Choose an option"
      placeholder="Choose"
      clearable
      data-testid="selector"
      @update:model-value="changes++"
    />
    <Selector
      :options
      label="Local selection"
      emit-key
      data-testid="local-selector"
    />
    <VaporSelectorHost />
  </main>
</template>
