<script setup lang="ts">
const { data } = useQuery({
  key: ['users'],
  query: () => $api().user.findMany({
    id: '1',
    age: 0,
  }),
})
</script>

<template>
  <div>
    <h1>Home</h1>
    <!-- <pre>{{ data }}</pre> -->
  </div>
</template>
