<script setup lang="ts">
import { type } from 'arktype'
import InputPrependPreview from '../components/testing/InputPrependPreview.vue'

const val = ref<number>()
const eventDate = ref<Datetime>()
const eventMonth = ref($date().startOf('month'))
const eventCategories = [
  { label: 'Schůzky', color: 'color-sky-500' },
  { label: 'Termíny', color: 'color-amber-500' },
  { label: 'Volno', color: 'color-emerald-500' },
]
const events = computed(() => {
  return [
    { day: 3, category: 0 },
    { day: 8, category: 0 },
    { day: 8, category: 1 },
    { day: 12, category: 2 },
    { day: 16, category: 0 },
    { day: 16, category: 1 },
    { day: 16, category: 2 },
    { day: 21, category: 1 },
    { day: 25, category: 2 },
  ].map(({ day, category }) => ({
    date: eventMonth.value.date(day).format('YYYY-MM-DD'),
    color: eventCategories[category]!.color,
  }))
})

onMounted(() => {
  val.value = 0
})
</script>

<template>
  <div
    flex="~ col gap-4"
    overflow="auto"
    h="95vh"
  >
    <InputPrependPreview />
    <FileInput />
    <YearSelector />
    <DatePicker
      v-model="eventDate"
      :events
      :ui="{ containerClass: ({ defaults }) => `${defaults.all} rounded-xl border border-slate-200 dark:border-ca` }"
      @update:period="eventMonth = $event.period.periodStart"
    />

    <Btn
      outlined
      label="Dialog"
    >
      <Dialog>
        Penis

        <Btn
          outlined
          label="x"
        >
          <Menu>
            asd

            <Btn
              outlined
              label="x"
            >
              last
            </Btn>
          </Menu>
        </Btn>
      </Dialog>
    </Btn>
  </div>
</template>
