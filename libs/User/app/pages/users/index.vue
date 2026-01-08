<script setup lang="ts">
// const { user } = useClientQueries()
// const { data } = user.useFindMany({ include: { posts: true } })

// const { data } = useQuery({
//   key: ['users'],
//   query: () => $fetch('/api/users'),
// })

const { $client } = useNuxtApp()

const data = await $client.user.findMany()
</script>

<template>
  <div>
    <h1>Users</h1>
    <pre>{{ data }}</pre>
  </div>
</template>
