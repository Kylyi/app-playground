<script setup lang="ts" vapor>
const route = useRoute()
const ready = ref(false)
const visible = ref(true)
const readonlyMode = ref(false)
const disabledMode = ref(false)
const customSlots = ref(false)
const value = ref<Datetime | undefined>('2026-06-15T14:30:00Z')
const utc = computed(() => route.query.utc === 'true')
const autoClose = computed(() => route.query.autoClose === 'true')
const events = reactive({ focus: 0, blur: 0, clear: 0 })
const input = useTemplateRef<{
  focus: () => void
  select: () => void
  blur: () => void
  clear: () => void
}>('input')
const shownValue = computed(() => isNil(value.value) ? 'empty' : $date(value.value).utc().format('YYYY-MM-DDTHH:mm[Z]'))
const disabledDays = (date: Dayjs) => date.date() === 17
const allowedDays = (date: Dayjs) => date.date() !== 18

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="datetime-full-example"
    :data-ready="ready"
    flex="~ col gap-4"
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
        @click="disabledMode = !disabledMode"
      >
        Toggle disabled
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
        @click="input?.select()"
      >
        Select datetime
      </button>
      <button
        data-example-control
        type="button"
        @mousedown.prevent
        @click="input?.blur()"
      >
        Blur datetime
      </button>
      <button
        data-example-control
        type="button"
        @click="input?.clear()"
      >
        Clear datetime
      </button>
      <button
        data-example-control
        type="button"
        @click="value = '2026-06-15T14:30:00Z'"
      >
        Reset datetime
      </button>
    </div>
    <DateTimeFullInput
      v-if="visible"
      ref="input"
      v-model="value"
      data-testid="datetime-full-field"
      label="Full datetime"
      :utc
      :auto-close
      :allowed-days
      :disabled-days
      :readonly="readonlyMode"
      :disabled="disabledMode"
      clearable
      @focus="events.focus++"
      @blur="events.blur++"
      @clear="events.clear++"
    >
      <template
        v-if="customSlots"
        #label="{ labelProps }"
      >
        <InputLabel
          v-bind="labelProps"
          label="Custom datetime"
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
          @click="focus()"
        >
          Focus datetime slot
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
          Clear datetime slot
        </button>
      </template>
    </DateTimeFullInput>
    <output
      data-example-output
      data-testid="datetime-full-value"
    >{{ shownValue }}</output>
    <output
      data-example-output
      data-testid="datetime-full-events"
    >{{ JSON.stringify(events) }}</output>
  </section>
</template>
