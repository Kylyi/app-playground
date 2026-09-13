<script setup lang="ts" vapor>
const selected = ref<Datetime>('2024-06-15T12:00:00.000Z')
const mounted = ref(true)
const ready = ref(false)
const selector = useTemplateRef('selector')
const selectedDate = computed(() => $date(selected.value).format('YYYY-MM-DD'))
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="year-example"
    :data-ready="ready"
  >
    <YearSelector
      v-if="mounted"
      ref="selector"
      v-model="selected"
      data-testid="year-selector"
      :ui="{
        containerStyle: () => ({ width: '220px' }),
        previousBtnClass: ({ defaults }) => [defaults.all, 'previous-year'],
        nextBtnClass: ({ defaults }) => [defaults.all, 'next-year'],
        menuContainerClass: ({ defaults }) => [defaults.all, 'year-options'],
      }"
    />
    <button
      data-example-control
      @click="selected = '2030-06-15T12:00:00.000Z'"
    >
      Set external year
    </button>
    <button
      data-example-control
      @click="selector?.sync()"
    >
      Sync draft year
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle year owner
    </button>
    <output
      data-example-output
      aria-label="Selected date"
      data-testid="selected-date"
    >{{ selectedDate }}</output>
  </section>
</template>
