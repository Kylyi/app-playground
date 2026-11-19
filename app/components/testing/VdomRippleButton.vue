<script setup lang="ts">
import { vRipple } from '#layers/ui/app/directives/ripple.directive'

defineProps<{ ripple?: boolean }>()
</script>

<template>
  <button
    v-ripple="ripple"
    class="ripple-example-control"
  >
    VDOM ripple
  </button>
</template>
