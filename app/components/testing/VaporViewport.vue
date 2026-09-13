<script setup lang="ts" vapor>
const ready = ref(false)
onMounted(() => ready.value = true)
const store = useUIStore()
const { width, height, viewportWidthCookie, viewportHeightCookie } = storeToRefs(store)
</script>

<template>
  <section flex="~ col gap-2">
    <p>
      Hydration viewport: <output
        data-example-output
        aria-label="Viewport"
        data-testid="viewport"
      >{{ width }} × {{ height }}</output>
    </p>
    <p>
      Viewport cookies: <output
        data-example-output
        aria-label="Viewport cookies"
        data-testid="viewport-cookies"
      >{{ ready ? `${viewportWidthCookie} × ${viewportHeightCookie}` : 'pending' }}</output>
    </p>
  </section>
</template>
