<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'

// Reinitialize examples that read their variant once during setup.
// Table filters and other component-owned query state must not remount the page.
function examplePageKey(route: RouteLocationNormalizedLoaded) {
  const variants = [
    'virtual',
    'mode',
    'small',
    'short',
    'fullscreen',
    'slow',
    'loading',
    'warning',
    'controls',
    'header',
    'updates',
  ]

  return JSON.stringify([route.path, ...variants.map(key => route.query[key] ?? null)])
}

useHead({
  htmlAttrs: {
    // class: 'bg-black color-white',
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />

    <NuxtPage :page-key="examplePageKey" />
  </NuxtLayout>
</template>

<style src="./assets/example-controls.css" />
