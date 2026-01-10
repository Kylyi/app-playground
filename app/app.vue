<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'bg-black color-white',
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />

    <NuxtPage />
  </NuxtLayout>
</template>
