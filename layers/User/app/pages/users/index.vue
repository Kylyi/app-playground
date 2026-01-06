<script setup lang="ts">
const { data: users } = await useFetch('/api/users')
</script>

<template>
  <div>
    <h1>Users</h1>
    <pre>{{ users }}</pre>
  </div>
</template>
