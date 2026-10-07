<script setup lang="ts" vapor>
import LifecycleRoot from '../../tests/fixtures/slot-lifecycle/LifecycleRoot.vue'

const route = useRoute()
const mode = typeof route.query.mode === 'string' ? route.query.mode : 'forwarded-fallback'
const owner = useTemplateRef('owner')
const events = ref<string[]>([])
const ready = ref(false)
onMounted(() => ready.value = true)
function report(event: string) {
  events.value.push(event)
}
</script>

<template>
  <section
    data-testid="slot-lifecycle"
    :data-ready="ready"
  >
    <h1>Native slot lifecycle · {{ mode }}</h1>
    <p>Hide and show the child to inspect mount, scope disposal and unmount events.</p>
    <button
      data-example-control
      type="button"
      @click="owner?.hide()"
    >
      Hide children
    </button>
    <button
      data-example-control
      type="button"
      @click="owner?.show()"
    >
      Show children
    </button>
    <output data-testid="slot-events">{{ JSON.stringify(events) }}</output>
    <LifecycleRoot
      ref="owner"
      :mode
      :report
    />
  </section>
</template>
