<script setup lang="ts" vapor>
import type { ITextInputExpose } from '#layers/ui/app/components/Inputs/TextInput/types/text-input-expose.type'

const ready = ref(false)
const model = ref<string | null>('initial')
const slotsVisible = ref(false)
const visible = ref(true)
const readonlyMode = ref(false)
const passwordMode = ref(false)
const enterCount = ref(0)
const clearCount = ref(0)
const input = ref<ITextInputExpose>()

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="text-input-example"
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
        @click="model = 'replacement'"
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
    <button
      data-example-control
      type="button"
      @click="passwordMode = !passwordMode"
    >
      Toggle password
    </button>
    <TextInput
      v-if="visible"
      ref="input"
      v-model="model"
      data-testid="text-input-field"
      :readonly="readonlyMode"
      :empty-value="null"
      :debounce="0"
      clearable
      :type="passwordMode ? 'password' : 'text'"
      hint="Text hint"
      tooltip="Text tooltip"
      label="Text"
      placeholder="Text value"
      layout="regular"
      @enter="enterCount++"
      @clear="clearCount++"
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
        Custom text hint
      </template>
    </TextInput>
    <output data-testid="text-input-events">{{ enterCount }} / {{ clearCount }}</output>
    <output
      data-example-output
      data-testid="text-input-value"
    >{{ model ?? 'empty' }}</output>
  </section>
</template>
