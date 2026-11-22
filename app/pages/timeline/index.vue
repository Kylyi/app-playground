<script setup lang="ts">
const directions = [
  {
    to: '/timeline/feed',
    title: 'Feed',
    description: 'Data-driven vertical timeline (`items` prop + slots): sides, alternate, markers, connectors, pending item.',
  },
  {
    to: '/timeline/composable',
    title: 'Composable',
    description: '`Timeline` + `TimelineItem` children like Stepper: vertical & horizontal, progress state, collapsible content.',
  },
  {
    to: '/timeline/log',
    title: 'Log',
    description: 'Grouped activity / audit log: sticky date groups, relative time, compact vs card rows, load more, large lists.',
  },
]
</script>

<template>
  <div
    flex="~ col gap-4"
    p="4"
    max-w="3xl"
  >
    <h1 text="2xl" font="semibold">
      Timeline prototypes
    </h1>

    <NuxtLink
      v-for="direction in directions"
      :key="direction.to"
      :to="direction.to"
      flex="~ col gap-1"
      p="4"
      border="1 solid ca/30 rounded-custom"
      hover="border-primary"
      transition="colors"
    >
      <span font="semibold">{{ direction.title }}</span>
      <span text="sm ca">{{ direction.description }}</span>
    </NuxtLink>
  </div>
</template>
