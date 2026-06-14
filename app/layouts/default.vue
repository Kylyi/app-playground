<script setup lang="ts">
const { toggleDark } = useTheme()
</script>

<template>
  <div class="layout layout--default">
    <div flex="~ gap-4">
      <Btn
        label="trigger"
        @click="toggleDark()"
      />
    </div>

    <slot />
  </div>
</template>

<style scoped lang="scss">
.layout--default {
  @apply flex flex-col;
}
</style>
