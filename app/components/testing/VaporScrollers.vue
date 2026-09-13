<script setup lang="ts" vapor>
const route = useRoute()
const arrows = computed(() => route.query.mode === 'inside' ? 'inside' : 'outside')
const horizontal = useTemplateRef('horizontal')
const vertical = useTemplateRef('vertical')
const mounted = ref(true)
const expandedViewport = ref(false)
const x = ref(60)
const y = ref(60)
const horizontalEvents = ref(0)
const verticalEvents = ref(0)
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="scrollers-example"
    :data-ready="ready"
  >
    <HorizontalScroller
      v-if="mounted"
      ref="horizontal"
      v-model:scroll-position="x"
      data-testid="horizontal"
      :arrows
      :ui="{ containerStyle: () => ({ width: expandedViewport ? '1200px' : '300px' }) }"
      @scrolled="horizontalEvents++"
    >
      <div class="horizontal-items">
        <span
          v-for="n in 20"
          :key="n"
        >Item {{ n }}</span>
      </div>
    </HorizontalScroller>
    <VerticalScroller
      v-if="mounted"
      ref="vertical"
      v-model:scroll-position="y"
      data-testid="vertical"
      :arrows
      :ui="{ containerStyle: () => ({ height: expandedViewport ? '900px' : '180px', width: '220px' }) }"
      @scrolled="verticalEvents++"
    >
      <div class="vertical-items">
        <span
          v-for="n in 20"
          :key="n"
        >Row {{ n }}</span>
      </div>
    </VerticalScroller>
    <button
      data-example-control
      @click="x = 0; y = 0"
    >
      Scroll to start
    </button>
    <button
      data-example-control
      @click="x = 140; y = 140"
    >
      Set positions
    </button>
    <button
      data-example-control
      @click="horizontal?.scroll(25, true); vertical?.scroll(25, true)"
    >
      Scroll relatively
    </button>
    <button
      data-example-control
      @click="horizontal?.scroll(10000); vertical?.scroll(10000)"
    >
      Scroll to end
    </button>
    <button
      data-example-control
      @click="expandedViewport = !expandedViewport"
    >
      Toggle overflow
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle owners
    </button>
    <output
      data-example-output
      aria-label="Horizontal position"
      data-testid="horizontal-position"
    >{{ x }}</output>
    <output
      data-example-output
      aria-label="Vertical position"
      data-testid="vertical-position"
    >{{ y }}</output>
    <output
      data-example-output
      aria-label="Horizontal events"
      data-testid="horizontal-events"
    >{{ horizontalEvents }}</output>
    <output
      data-example-output
      aria-label="Vertical events"
      data-testid="vertical-events"
    >{{ verticalEvents }}</output>
  </section>
</template>

<style scoped>
.horizontal-items {
  @apply flex shrink-0;

  span {
    @apply w-12 shrink-0;
  }
}

.vertical-items {
  @apply flex flex-col shrink-0;

  span {
    @apply h-8 shrink-0;
  }
}
</style>
