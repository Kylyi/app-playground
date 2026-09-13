<script setup lang="ts" vapor>
import type { IDateInputExpose } from '#layers/ui/app/components/Inputs/DateInput/types/date-input-expose.type'
import type { ITimeInputExpose } from '#layers/ui/app/components/Inputs/TimeInput/types/time-input-expose.type'

const ready = ref(false)
const visible = ref(true)
const readonlyMode = ref(false)
const customSlots = ref(false)
const dateValue = ref<string | undefined>('2026-06-15')
const timeValue = ref<string | undefined>('14:30')
const yearMonthValue = ref<string | undefined>('2026-06')
const dateInput = ref<IDateInputExpose>()
const timeInput = ref<ITimeInputExpose>()
const shortcuts = [{ label: 'Morning', value: '09:15' }, { label: 'Evening', value: '18:45' }]

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="date-time-example"
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
        @click="customSlots = !customSlots"
      >
        Toggle slots
      </button>
      <button
        data-example-control
        type="button"
        @click="dateInput?.select()"
      >
        Select date
      </button>
      <button
        data-example-control
        type="button"
        @click="timeInput?.select()"
      >
        Select time
      </button>
      <button
        data-example-control
        type="button"
        @mousedown.prevent
        @click="timeInput?.blur()"
      >
        Blur time
      </button>
      <button
        data-example-control
        type="button"
        @click="timeValue = '23:10'"
      >
        Replace time
      </button>
    </div>
    <DateInput
      v-if="visible"
      ref="dateInput"
      v-model="dateValue"
      data-testid="date-field"
      format="YYYY-MM-DD"
      label="Date"
      hint="Date hint"
      :readonly="readonlyMode"
      clearable
      auto-close
    >
      <template
        v-if="customSlots"
        #label="{ labelProps }"
      >
        <InputLabel
          v-bind="labelProps"
          label="Custom Date"
        />
      </template>
      <template
        v-if="customSlots"
        #prepend="{ focus }"
      >
        <button
          data-example-control
          type="button"
          position="relative"
          @click="focus"
        >
          Focus date
        </button>
      </template>
      <template
        v-if="customSlots"
        #append="{ clear }"
      >
        <button
          data-example-control
          type="button"
          position="relative"
          @click="clear()"
        >
          Clear date
        </button>
      </template>
    </DateInput>
    <output
      data-example-output
      data-testid="date-value"
    >{{ dateValue ?? 'empty' }}</output>
    <TimeInput
      v-if="visible"
      ref="timeInput"
      v-model="timeValue"
      data-testid="time-field"
      label="Time"
      :readonly="readonlyMode"
      :shortcuts
      clearable
    >
      <template
        v-if="customSlots"
        #label="{ labelProps }"
      >
        <InputLabel
          v-bind="labelProps"
          label="Custom Time"
        />
      </template>
      <template
        v-if="customSlots"
        #shortcuts
      >
        <div data-testid="custom-shortcuts">
          Custom shortcuts
        </div>
      </template>
    </TimeInput>
    <output
      data-example-output
      data-testid="time-value"
    >{{ timeValue ?? 'empty' }}</output>
    <YearMonthSelector
      v-model="yearMonthValue"
      value-format="year-month"
      label="Year and month"
      clearable
      data-testid="year-month-field"
    />
    <output
      data-example-output
      data-testid="year-month-value"
    >{{ yearMonthValue ?? 'empty' }}</output>
  </section>
</template>
