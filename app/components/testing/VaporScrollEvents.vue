<script setup lang="ts" vapor>
import { useScrollerScroll } from '../../../packages/UI/app/components/Scroller/composables/useScrollerScroll'

const emitted = ref(0)
const ready = ref(false)
onMounted(() => ready.value = true)
const { scrollEl } = useScrollerScroll(position => emitted.value = position)
</script>

<template>
  <div>
    <output
      data-example-output
      aria-label="Scroll position"
      data-testid="scroll-position"
    >{{ emitted }}</output>
    <div
      ref="scrollEl"
      data-testid="scroll-target"
      :data-ready="ready"
      class="scroll-target"
    >
      <div class="scroll-content">
        Scroll content
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-target {
  width: 200px;
  height: 120px;
  overflow: auto;
}
.scroll-content {
  width: 800px;
  height: 600px;
}
</style>
