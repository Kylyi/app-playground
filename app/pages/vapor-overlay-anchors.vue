<script setup lang="ts" vapor>
import Menu from '../../packages/UI/app/components/Menu/Menu.vue'
import Tooltip from '../../packages/UI/app/components/Tooltip/Tooltip.vue'

const ready = ref(false)
const menuTarget = ref<string>()
const menuManual = ref(false)
const contextMenu = ref(false)
const menuMounted = ref(true)
const menuModel = ref(false)
const hides = ref(0)
const tooltipTarget = ref<string>()
const tooltipManual = ref(false)
const tooltipMounted = ref(true)
const tooltipModel = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <main
    data-testid="overlay-anchors"
    :data-ready="ready"
    p="8"
  >
    <div data-testid="menu-host">
      <button
        id="menu-a"
        data-example-control
      >
        Menu A
      </button>
      <button
        id="menu-b"
        data-example-control
      >
        Menu B
      </button>
      <Menu
        v-if="menuMounted"
        v-model="menuModel"
        :target="menuTarget"
        :manual="menuManual"
        :trigger="contextMenu ? 'contextmenu' : 'click'"
        no-transition
        no-overlay
        no-uplift
        data-testid="anchored-menu"
        @hide="hides++"
      >
        <template #default="{ hide }">
          <button
            data-example-control
            @click="hide()"
          >
            Close menu
          </button>
        </template>
      </Menu>
    </div>
    <output
      data-example-output
      aria-label="Menu model"
      data-testid="menu-model"
    >{{ menuModel }}</output>
    <output
      data-example-output
      aria-label="Menu hides"
      data-testid="menu-hides"
    >{{ hides }}</output>
    <button
      data-example-control
      @click="menuTarget = '#menu-b'"
    >
      Retarget menu
    </button>
    <button
      data-example-control
      @click="contextMenu = !contextMenu"
    >
      Change menu event
    </button>
    <button
      data-example-control
      @click="menuManual = !menuManual"
    >
      Toggle menu manual
    </button>
    <button
      data-example-control
      @click="menuMounted = !menuMounted"
    >
      Toggle menu owner
    </button>
    <div data-testid="tooltip-host">
      <button
        id="tooltip-a"
        data-example-control
      >
        Tooltip A
      </button>
      <button
        id="tooltip-b"
        data-example-control
      >
        Tooltip B
      </button>
      <Tooltip
        v-if="tooltipMounted"
        v-model="tooltipModel"
        :reference-target="tooltipTarget"
        :manual="tooltipManual"
        :delay="[150, 0]"
        data-testid="anchored-tooltip"
      >
        Tooltip content
      </Tooltip>
    </div>
    <output
      data-example-output
      aria-label="Tooltip model"
      data-testid="tooltip-model"
    >{{ tooltipModel }}</output>
    <button
      data-example-control
      @click="tooltipTarget = '#tooltip-b'"
    >
      Retarget tooltip
    </button>
    <button
      data-example-control
      @click="tooltipManual = !tooltipManual"
    >
      Toggle tooltip manual
    </button>
    <button
      data-example-control
      @click="tooltipMounted = !tooltipMounted"
    >
      Toggle tooltip owner
    </button>
  </main>
</template>
