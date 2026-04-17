<script setup lang="ts">

</script>

<template>
  <div class="layout layout--default">
    <div flex="~ gap-4">
      ...links here...
    </div>

    <slot />
  </div>
</template>

<style scoped lang="scss">
.layout--default {
  @apply flex flex-col;
}
</style>
