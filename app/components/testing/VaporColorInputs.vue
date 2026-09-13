<script setup lang="ts" vapor>
import type { IColorInputExpose } from '#layers/ui/app/components/Inputs/ColorInput/types/color-input-expose.type'

const route = useRoute()
const tw = computed(() => route.query.mode === 'tw')
const ready = ref(false)
const model = ref<string | undefined>('#ff0000')
const palette = ref('rgba(255, 0, 0, 1)')
const input = ref<IColorInputExpose>()
const visible = ref(true)
const readonlyMode = ref(false)
const slotsVisible = ref(false)
const rangeValue = ref(25)

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="color-inputs-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle owner
      </button>
      <button
        data-example-control
        type="button"
        @click="readonlyMode = !readonlyMode"
      >
        Toggle readonly
      </button>
      <button
        data-example-control
        type="button"
        @click="slotsVisible = !slotsVisible"
      >
        Toggle slots
      </button>
      <button
        data-example-control
        type="button"
        @click="model = '#00ff00'"
      >
        Replace model
      </button>
      <button
        data-example-control
        type="button"
        @click="input?.focus()"
      >
        Focus input
      </button>
      <button
        data-example-control
        type="button"
        @click="input?.select()"
      >
        Select input
      </button>
      <button
        data-example-control
        type="button"
        @mousedown.prevent
        @click="input?.blur()"
      >
        Blur input
      </button>
    </div>
    <ColorInput
      v-if="visible"
      ref="input"
      v-model="model"
      data-testid="color-input-field"
      :readonly="readonlyMode"
      :rgba="!tw"
      :tw
      :debounce="0"
      clearable
      transform-tw
      auto-close
      label="Color"
      placeholder="Color value"
      layout="regular"
    >
      <template
        v-if="slotsVisible"
        #label="{ labelProps }"
      >
        <InputLabel
          v-bind="labelProps"
          :label="`Custom ${labelProps.label}`"
        />
      </template>
      <template
        v-if="slotsVisible"
        #append="{ focus, clear }"
      >
        <button
          data-example-control
          type="button"
          position="relative"
          @click="focus"
        >
          Slot focus
        </button>
        <button
          data-example-control
          type="button"
          position="relative"
          @click="clear()"
        >
          Slot clear
        </button>
      </template>
    </ColorInput>
    <output
      data-example-output
      data-testid="color-input-value"
    >{{ model ?? 'empty' }}</output>
    <div
      v-if="visible"
      data-testid="standalone-palette"
    >
      <ColorPicker
        v-model="palette"
        :rgba="!tw"
        :tw
        :disallowed-colors="['black']"
      />
    </div>
    <output
      data-example-output
      data-testid="palette-value"
    >{{ palette }}</output>
    <RangeInput
      v-model="rangeValue"
      data-testid="standalone-range"
      :min="0"
      :max="100"
      :step="5"
    />
    <output
      data-example-output
      data-testid="range-value"
    >{{ rangeValue }}</output>
  </section>
</template>
