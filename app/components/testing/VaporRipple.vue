<script setup lang="ts" vapor>
import UIChip from '#layers/ui/app/components/Chip/Chip.vue'
import { vRippleVapor as vRipple } from '#layers/ui/app/directives/ripple.directive'

const enabled = ref(false)
const disabled = ref(false)
const mounted = ref(true)
const linked = ref(false)
const removed = ref(0)
const bubbled = ref(0)
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="ripple-example"
    :data-ready="ready"
  >
    <div
      data-testid="owners"
      @click="bubbled++"
    >
      <button
        v-if="mounted"
        v-ripple="enabled"
        data-example-control
        data-testid="native-ripple"
        :disabled
        class="ripple-example-control"
      >
        Native Vapor ripple
      </button>
      <Btn
        v-if="mounted"
        outlined
        data-testid="vdom-ripple"
        label="VDOM ripple"
        :ripple="enabled"
        :disabled
      />
      <UIChip
        v-if="mounted"
        data-testid="chip-ripple"
        :label="() => 'Vapor chip'"
        :ripple="enabled"
        :to="linked ? '/cs-CZ/vapor-ripple' : undefined"
        has-remove
        :remove-btn="{ label: 'Remove chip', ripple: false }"
        @remove="removed++"
      />
    </div>
    <button
      data-example-control
      @click="enabled = !enabled"
    >
      Toggle ripple
    </button>
    <button
      data-example-control
      @click="disabled = !disabled"
    >
      Toggle disabled
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle owners
    </button>
    <button
      data-example-control
      @click="linked = !linked"
    >
      Toggle chip link
    </button>
    <output
      data-example-output
      aria-label="Removed"
      data-testid="removed"
    >{{ removed }}</output>
    <output
      data-example-output
      aria-label="Bubbled"
      data-testid="bubbled"
    >{{ bubbled }}</output>
  </section>
</template>

<style scoped>
.ripple-example-control {
  @apply relative border-2 p-4;
}
</style>
