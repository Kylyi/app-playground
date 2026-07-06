<script setup lang="ts">
const { data } = useFetch('/api/from-lib')
</script>

<template>
  <div>
    <h1>Test</h1>
    {{ data?.message }}
  </div>
</template>
