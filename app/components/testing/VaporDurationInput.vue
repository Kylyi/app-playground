<script setup lang="ts" vapor>
const ready = ref(false)
const model = ref<number | null>(7200000)
const slotsVisible = ref(false)
const readonlyMode = ref(false)
const visible = ref(true)
const focusCount = ref(0)
const blurCount = ref(0)
const touched = ref(false)
const input = ref<{
  focus: () => void
  select: () => void
  blur: () => void
  isTouched: () => boolean
}>()

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="duration-input-example"
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
        @click="readonlyMode = !readonlyMode"
      >
        Toggle readonly
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
        @click="touched = input?.isTouched() ?? false"
      >
        Read touched
      </button>
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle input owner
      </button>
    </div>
    <div data-testid="duration-input-field">
      <DurationInput
        v-if="visible"
        ref="input"
        v-model="model"
        :readonly="readonlyMode"
        :empty-value="null"
        :clearable="false"
        :step="0"
        :has-copy-btn="false"
        :allowed-units="['minute', 'hour']"
        initial-duration-unit="hour"
        layout="regular"
        label="Duration"
        placeholder="Duration value"
        @focus="focusCount++"
        @blur="blurCount++"
      >
        <template
          v-if="slotsVisible"
          #label="{ labelProps }"
        >
          <InputLabel
            v-bind="labelProps"
            data-testid="duration-label"
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
            @click="clear"
          >
            Slot clear
          </button>
        </template>
      </DurationInput>
    </div>
    <output
      data-example-output
      data-testid="duration-value"
    >{{ model ?? 'empty' }}</output>
    <output
      data-example-output
      data-testid="duration-events"
    >{{ focusCount }}/{{ blurCount }}</output>
    <output
      data-example-output
      data-testid="duration-touched"
    >{{ touched }}</output>
  </section>
</template>
