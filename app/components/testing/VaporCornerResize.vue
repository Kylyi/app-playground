<script setup lang="ts" vapor>
const visible = ref(true)
const ready = ref(false)
const corners = ref({ n: 20, e: 20, w: 20 })
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="corner-resize"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="visible = !visible"
    >
      Toggle corners
    </button>
    <p>Táhni za horní nebo boční hrany. Krok je 5, rozsah 0–60. Pravá hrana má obrácený směr.</p>
    <output
      data-example-output
      aria-label="Corner values"
      data-testid="corner-values"
    >{{ JSON.stringify(corners) }}</output>
    <div
      v-if="visible"
      class="corner-preview"
    >
      <CornerResize
        v-model="corners"
        :step="5"
        :inverted="{ e: true }"
        :limits="{ n: { min: 0, max: 60 }, e: { min: 0, max: 60 }, w: { min: 0, max: 60 } }"
      />
      Hodnoty hran
    </div>
  </section>
</template>

<style scoped>
.corner-preview {
  @apply relative w-80 h-40 m-8 p-8 bg-blue-100 border border-blue-500;
}
</style>
