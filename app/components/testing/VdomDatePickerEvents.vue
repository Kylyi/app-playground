<script setup lang="ts">
// A VDOM owner derives the DatePicker events from the period it emits,
// the way application pages decorate the displayed month. The picker emits
// during setup, after the server already rendered the counter, so the counter
// is shown only after mount.
const selected = ref<Datetime>('2026-06-15')
const month = ref($date('2026-06-15').startOf('month'))
const periodUpdates = ref(0)
const ready = ref(false)

const events = computed(() => {
  return [3, 16].map(day => ({
    date: month.value.date(day).format('YYYY-MM-DD'),
    color: 'period-event color-sky-500',
  }))
})

function handlePeriod(payload: { period: Period }) {
  periodUpdates.value++
  month.value = payload.period.periodStart
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="date-picker-events"
    :data-ready="ready"
  >
    <DatePicker
      v-model="selected"
      :events
      data-testid="date-picker"
      @update:period="handlePeriod"
    />
    <output
      data-example-output
      aria-label="Period updates"
      data-testid="period-updates"
    >{{ ready ? periodUpdates : '' }}</output>
    <output
      data-example-output
      aria-label="Period month"
      data-testid="period-month"
    >{{ month.format('YYYY-MM') }}</output>
  </section>
</template>
