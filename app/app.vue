<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'bg-black color-white',
  },
})
</script>

<template>
  <NuxtLayout>
    <Notifications />
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />

    <NuxtPage />
  </NuxtLayout>
</template>
