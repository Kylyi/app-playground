<script setup lang="ts" vapor>
const props = defineProps<{ hide: () => void }>()
const message = inject<Ref<string>>('native-dialog-message')
</script>

<template>
  <p data-testid="native-dialog-context">
    {{ message }}
  </p>
  <button
    data-testid="hide-native-dialog"
    @click="props.hide()"
  >
    Close native dialog
  </button>
</template>
