<script setup lang="ts" vapor>
const mounted = ref(true)
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    :data-ready="ready"
    data-testid="input-anchors"
  >
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle inputs
    </button>
    <div
      v-if="mounted"
      flex="~ col gap-8"
      w="80"
      m="l-16 t-12"
    >
      <div data-testid="text-anchor">
        <TextInput
          label="Text"
          tooltip="Input guidance"
        />
      </div>
      <div data-testid="color-anchor">
        <ColorInput
          label="Color"
          model-value="#ff0000"
        />
      </div>
      <div data-testid="icon-anchor">
        <IconInput
          label="Icon"
          model-value="i-tabler:home"
        />
      </div>
      <div data-testid="month-anchor">
        <YearMonthSelector label="Month" />
      </div>
    </div>
  </section>
</template>
