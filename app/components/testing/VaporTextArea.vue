<script setup lang="ts" vapor>
import type { ITextAreaExpose } from '#layers/ui/app/components/Inputs/TextArea/types/text-area-expose.type'

const ready = ref(false)
const model = ref<string | null>('initial')
const slotsVisible = ref(false)
const visible = ref(true)
const readonlyMode = ref(false)
const route = useRoute()
const autogrow = computed(() => route.query.autogrow !== 'false')
const clearCount = ref(0)
const input = ref<ITextAreaExpose>()

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="text-area-example"
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
        @click="input?.updateMask(mask => mask.value = 'mask edit')"
      >
        Update mask
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
    <TextArea
      v-if="visible"
      :key="autogrow ? 'grow' : 'fixed'"
      ref="input"
      v-model="model"
      data-testid="text-area-field"
      :readonly="readonlyMode"
      :empty-value="null"
      :debounce="0"
      clearable
      :autogrow
      :rows="3"
      resize="resize-y"
      hint="Area hint"
      tooltip="Area tooltip"
      label="Area"
      placeholder="Area value"
      layout="regular"
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
        Custom area hint
      </template>
      <template
        v-if="slotsVisible"
        #inner
      >
        <span data-testid="area-inner">Inner content</span>
      </template>
      <template
        v-if="slotsVisible"
        #menu
      >
        <span data-testid="area-menu">Menu content</span>
      </template>
    </TextArea>
    <output data-testid="text-area-events">{{ clearCount }}</output>
    <output
      data-example-output
      data-testid="text-area-value"
    >{{ model ?? 'empty' }}</output>
  </section>
</template>
