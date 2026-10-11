<script setup lang="ts" vapor>
import type { INumberInputExpose } from '#layers/ui/app/components/Inputs/NumberInput/types/number-input-expose.type'

const ready = ref(false)
const route = useRoute()
const isCell = route.query.mode === 'cell'
const isExact = route.query.mode === 'exact'
const model = ref<number | null>(isExact ? 1e-21 : 12.5)
const updates = ref(0)
const slotsVisible = ref(false)
const visible = ref(true)
const readonlyMode = ref(false)
const input = ref<INumberInputExpose>()

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="number-input-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
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
      <button
        data-example-control
        type="button"
        @click="model = 7.5"
      >
        Replace model
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
        @click="visible = !visible"
      >
        Toggle owner
      </button>
    </div>
    <NumberInput
      v-if="visible"
      ref="input"
      v-model="model"
      data-testid="number-input-field"
      :readonly="readonlyMode"
      :variant="isCell ? 'cell' : 'regular'"
      :size="isCell ? 'xs' : 'md'"
      :exact="isExact"
      :empty-value="null"
      :step="0.5"
      :fraction-digits="2"
      :debounce="0"
      no-grouping
      clearable
      label="Number"
      placeholder="Number value"
      layout="regular"
      @update:model-value="updates++"
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
        #prepend="{ focus }"
      >
        <button
          data-example-control
          type="button"
          position="relative"
          @click="focus"
        >
          Slot focus
        </button>
      </template>
      <template
        v-if="slotsVisible"
        #append="{ clear }"
      >
        <button
          data-example-control
          type="button"
          position="relative"
          @click="clear()"
        >
          Slot clear
        </button>
      </template>
      <template
        v-if="slotsVisible"
        #hint
      >
        Custom number hint
      </template>
    </NumberInput>
    <output
      data-example-output
      data-testid="number-input-value"
    >{{ model ?? 'empty' }}</output>
    <output data-testid="number-input-updates">{{ updates }}</output>
  </section>
</template>
