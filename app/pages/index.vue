<script setup lang="ts">
// const { data } = useQuery({
//   key: ['users'],
//   query: () => $api().user.findMany({ id }),
// })

const x = ref(false)
const y = ref(false)
const date = ref($date('2026-01-11 00:30:00', { utc: false }))
const date2 = ref($date('2026-01-11 23:30:00', { utc: true }))
</script>

<template>
  <div flex="~ col gap-4">
    <h1>Home</h1>
  </div>
</template>
