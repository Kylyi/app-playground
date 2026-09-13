<script setup lang="ts" vapor>
import VaporFloatingTarget from '../components/testing/VaporFloatingTarget.vue'
import Menu from '../../packages/UI/app/components/Menu/Menu.vue'
import Tooltip from '../../packages/UI/app/components/Tooltip/Tooltip.vue'

const component = useTemplateRef<InstanceType<typeof VaporFloatingTarget>>('component')
const alternate = ref(false)
const mounted = ref(true)
const mode = ref('component')
const menu = ref(false)
const tooltip = ref(false)
const ready = ref(false)

const target = computed(() => {
  if (mode.value === 'getter') {
    return () => component.value
  }

  if (mode.value === 'selector') {
    return () => '.floating-test-target'
  }

  return component.value
})

onMounted(() => {
  ready.value = true
})
</script>

<template>
  <main
    data-testid="floating-target-page"
    :data-ready="ready"
    p="8"
  >
    <VaporFloatingTarget
      v-if="mounted"
      ref="component"
      :alternate
    />

    <Menu
      v-model="menu"
      :target
      :reference-target="target"
      :ignore-click-outside="['button']"
      no-overlay
      no-uplift
      no-transition
      data-testid="target-menu"
    >
      Menu content
    </Menu>

    <Tooltip
      v-model="tooltip"
      :reference-target="target"
      :delay="[0, 0]"
      data-testid="target-tooltip"
    >
      Tooltip content
    </Tooltip>

    <button
      data-example-control
      @click="alternate = !alternate"
    >
      Swap element
    </button>

    <button
      data-example-control
      @click="mode = 'getter'"
    >
      Use component getter
    </button>

    <button
      data-example-control
      @click="mode = 'selector'"
    >
      Use selector getter
    </button>

    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle target component
    </button>

    <button
      data-example-control
      @click="menu = false"
    >
      Close menu
    </button>

    <output
      data-example-output
      aria-label="Target models"
      data-testid="target-models"
    >{{ menu }}/{{ tooltip }}</output>
  </main>
</template>
