<script setup lang="ts">
// const { data } = useQuery({
//   key: ['users'],
//   query: () => $api().user.findMany({ id }),
// })

const x = ref(false)
const y = ref(false)
const date = ref($date('2026-01-11 00:30:00', { utc: false }))
const date2 = ref($date('2026-01-11 23:30:00', { utc: true }))
const tab = ref('1')
</script>

<template>
  <div flex="~ col gap-4">
    <h1>Home</h1>

    <Banner
      label="Lorem"
      w="100"
      :counter="10"
      variant="success"
      outlined
      h="20"
      icon-center
    />

    <Btn
      label="Lorem"
      @click="notify('Lorem', 'positive')"
    />
    <Btn
      label="Lorem"
      @click="notify('Morem', 'positive')"
    />

    <Checkbox
      v-model="x"
      label="Lorem"
    />
    <Collapse title="Lorem">
      <Toggle
        label="Lorem"
        size="md"
      />

      <ProgressBar
        :progress="48"
        label="Lorem"
      />
    </Collapse>

    <span>{{ date }}</span>
    <span>{{ date2 }}</span>

    <DatePicker v-model="date" />
  </div>
</template>
