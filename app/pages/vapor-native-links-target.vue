<script setup lang="ts" vapor>
const router = useRouter()
const route = computed(() => router.currentRoute.value)
const localePath = useLocalePath()
</script>

<template>
  <section data-testid="link-destination">
    <h1>Native link destination</h1>
    <output data-testid="destination-item">{{ route.query.item }}</output>
    <UILink :to="localePath({ path: '/vapor-native-links' })">
      Return to links
    </UILink>
  </section>
</template>
