<script setup lang="ts">
const { toggleDark } = useTheme()
</script>

<template>
  <div class="layout layout--default">
    <div flex="~ gap-4">
      <NuxtLink to="/">
        Home
      </NuxtLink>
      <NuxtLink to="/zz">
        ZZ
      </NuxtLink>

      <Btn
        label="Toggle dark"
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
