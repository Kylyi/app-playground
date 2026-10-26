<script setup lang="ts">
const route = useRoute()
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <Tabs
    v-if="route.query.mode === 'basic'"
    data-testid="basic-tabs"
    :data-ready="ready"
  >
    <Tab name="tab1">
      Content
    </Tab>
    <Tab name="tab2">
      <Tabs data-testid="inner-tabs">
        <Tab name="inner">
          Nested content
        </Tab>
      </Tabs>
    </Tab>
  </Tabs>
  <VaporTabsAccessibility v-else-if="route.query.mode === 'keyboard' || route.query.mode === 'automatic'" />
  <VaporTabs v-else />
</template>
