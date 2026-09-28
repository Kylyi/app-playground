<script setup lang="ts" vapor>
const route = useRoute()
const menuOpen = ref(false)
const menuDimensions = ref({ x: 680, y: 220, w: 240, h: 160 })
const visible = ref(true)
const ready = ref(false)
const movable = ref(true)
const dimensions = ref({ x: 360, y: 220, w: 240, h: 160 })
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="element-movement"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="visible = !visible"
    >
      Toggle movement
    </button>
    <button
      data-example-control
      @click="menuOpen = !menuOpen"
    >
      Toggle movable menu
    </button>
    <Menu
      v-model="menuOpen"
      v-model:virtual-dimensions="menuDimensions"
      title="Movable menu"
      manual
      no-transition
      no-overlay
      no-uplift
      :virtual-config="{ enabled: true, movable }"
    >
      <template
        v-if="route.query.header"
        #header="{ mousedown, pointerdown }"
      >
        <div
          data-testid="custom-menu-header"
          class="p-4 cursor-move touch-none"
          @mousedown="route.query.header === 'mouse' && mousedown($event)"
          @pointerdown="route.query.header === 'pointer' && pointerdown($event)"
        >
          Custom movable header
        </div>
      </template>
      Drag the menu header.
    </Menu>
    <button
      data-example-control
      @click="movable = !movable"
    >
      Toggle movable
    </button>
    <output
      data-example-output
      aria-label="Menu dimensions"
      data-testid="menu-dimensions"
    >{{ JSON.stringify(menuDimensions) }}</output>
    <output
      data-example-output
      aria-label="Dimensions"
      data-testid="dimensions"
    >{{ JSON.stringify(dimensions) }}</output>
    <div
      v-if="visible"
      data-testid="moving-box"
      class="moving-box"
      :style="{
        left: `${dimensions.x}px`,
        top: `${dimensions.y}px`,
        width: `${dimensions.w}px`,
        height: `${dimensions.h}px`,
      }"
    >
      <ElementMove v-model:dimensions="dimensions">
        <div
          data-testid="move-handle"
          cursor="move"
          p="4"
        >
          Drag here
        </div>
      </ElementMove>
      <p p="4">
        Resize using the edges.
      </p>
      <ElementResize
        v-model:dimensions="dimensions"
        :limits="{ minW: 160, minH: 100 }"
      />
    </div>
  </section>
</template>

<style scoped>
.moving-box {
  @apply fixed bg-blue-100 border border-blue-500;
}
</style>
