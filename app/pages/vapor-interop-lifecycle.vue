<script setup lang="ts" vapor>
import InteropLifecycleRoot from '../../tests/fixtures/interop-lifecycle/InteropLifecycleRoot.vue'

const route = useRoute()
const mode = computed(() => route.query.mode === 'direct' ? 'direct' : 'wrapped')
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
    data-testid="interop-lifecycle"
    :data-ready="ready"
  >
    <h2>VDOM child lifecycle under Vapor · {{ mode }}</h2>
    <p>The child intentionally uses VDOM to check cleanup across the renderer boundary.</p>
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
    <output data-testid="interop-events">{{ JSON.stringify(events) }}</output>
    <InteropLifecycleRoot
      ref="owner"
      :mode
      :report
    />
  </section>
</template>
