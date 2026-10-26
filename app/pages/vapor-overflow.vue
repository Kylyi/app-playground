<script setup lang="ts">
import VaporOverflow from '../components/testing/VaporOverflow.vue'
import type { ComponentExposed } from 'vue-component-type-helpers'

const mounted = ref(true)
const reports = ref(0)
const overflow = useTemplateRef<ComponentExposed<typeof VaporOverflow>>('overflow')

function removeOwner() {
  mounted.value = false
  overflow.value?.refresh()
}
</script>

<template>
  <main>
    <VaporOverflow
      v-if="mounted"
      ref="overflow"
      :on-report="() => reports++"
    />

    <output
      data-example-output
      aria-label="Overflow reports"
      data-testid="overflow-reports"
    >{{ reports }}</output>
    <button
      data-example-control
      @click="removeOwner"
    >
      Refresh and remove owner
    </button>
  </main>
</template>
