<script setup lang="ts" vapor>
const mounted = ref(true)
const tall = ref(false)
const extra = ref(false)
const immediate = ref(false)
const ready = ref(false)
const area = useTemplateRef<{ scrollToBottom: () => void }>('area')

onMounted(() => {
  ready.value = true
})
</script>

<template>
  <main
    data-testid="scroll-area-fixture"
    :data-ready="ready"
    p="8"
  >
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle area
    </button>

    <button
      data-example-control
      @click="tall = !tall"
    >
      Resize content
    </button>

    <button
      data-example-control
      @click="extra = !extra"
    >
      Toggle child
    </button>

    <button
      data-example-control
      @click="immediate = !immediate"
    >
      Toggle immediate
    </button>

    <button
      data-example-control
      @click="area?.scrollToBottom()"
    >
      Scroll to bottom
    </button>

    <!-- Simulate the transition-bearing DOM ancestor without relying on its renderer. -->
    <section
      class="menu has-transition"
      style="--transitionDuration: 300ms"
    >
      <ScrollArea
        v-if="mounted"
        ref="area"
        :immediate
        :ui="{ containerStyle: () => ({ position: 'relative', width: '240px', height: '120px' }) }"
      >
        <div
          data-testid="scroll-child"
          :style="{ height: tall ? '400px' : '40px' }"
        >
          Content
        </div>

        <div
          v-if="extra"
          data-testid="extra-child"
          style="height: 400px"
        >
          Extra content
        </div>
      </ScrollArea>
    </section>
  </main>
</template>
