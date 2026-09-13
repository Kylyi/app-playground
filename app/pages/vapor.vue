<script setup lang="ts">
import VaporProbe from '../components/VaporProbe.vue'

const count = ref(0)
const visible = ref(true)
</script>

<template>
  <main class="vapor-test">
    <h1>Nuxt Vapor smoke test</h1>
    <p>VDOM page → Vapor component → existing UI Badge.</p>
    <p data-testid="parent-count">
      Parent count: {{ count }}
    </p>
    <button
      data-example-control
      data-testid="toggle-probe"
      type="button"
      @click="visible = !visible"
    >
      Toggle component
    </button>
    <VaporProbe
      v-if="visible"
      :count="count"
      @increment="count++"
    >
      <template #default="slotProps">
        <p data-testid="interop-slot">
          VDOM slot count: {{ slotProps.count }}
        </p>
      </template>
    </VaporProbe>
  </main>
</template>

<style scoped>
.vapor-test {
  max-width: 48rem;
  padding: 2rem;
}
.vapor-test :deep(button),
.vapor-test :deep(input) {
  border: 1px solid #888;
  border-radius: 0.25rem;
  padding: 0.5rem;
  margin: 0.5rem;
}
</style>
