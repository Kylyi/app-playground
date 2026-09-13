<script setup lang="ts" vapor>
import type { ITextInputExpose } from '#layers/ui/app/components/Inputs/TextInput/types/text-input-expose.type'

const ready = ref(false)
const route = useRoute()
const layout = ref<'regular' | 'inline' | 'label-inside'>(
  route.query.mode === 'inline' || route.query.mode === 'label-inside'
    ? route.query.mode
    : 'regular',
)
const model = ref<string | undefined>('')
const visible = ref(true)
const wide = ref(false)
const prepend = ref(true)
const readonlyMode = ref(false)
const disabledMode = ref(false)
const loading = ref(false)
const input = ref<ITextInputExpose>()

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="input-layouts-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <select
        v-model="layout"
        data-example-control
        aria-label="Layout"
      >
        <option value="regular">
          Regular
        </option>
        <option value="inline">
          Inline
        </option>
        <option value="label-inside">
          Label inside
        </option>
      </select>
      <button
        data-example-control
        type="button"
        @click="wide = !wide"
      >
        Resize prepend
      </button>
      <button
        data-example-control
        type="button"
        @click="prepend = !prepend"
      >
        Toggle prepend
      </button>
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
        @click="disabledMode = !disabledMode"
      >
        Toggle disabled
      </button>
      <button
        data-example-control
        type="button"
        @click="loading = !loading"
      >
        Toggle loading
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
        @click="input?.focus()"
      >
        Focus input
      </button>
    </div>
    <TextInput
      v-if="visible"
      ref="input"
      v-model="model"
      data-testid="layout-field"
      :layout
      label="Layout label"
      hint="Layout hint"
      tooltip="Layout tooltip"
      stack-label
      :readonly="readonlyMode"
      :disabled="disabledMode"
      :loading
      clearable
      :ui="{ borderRadius: '12px', focusInputOnLabelClick: true, inputClass: () => 'font-mono' }"
    >
      <template
        v-if="prepend"
        #prepend
      >
        <span
          data-testid="layout-prepend"
          :style="{ width: wide ? '120px' : '60px' }"
        >Prefix</span>
      </template>
    </TextInput>
    <output
      data-example-output
      data-testid="layout-value"
    >{{ model ?? 'empty' }}</output>
  </section>
</template>
