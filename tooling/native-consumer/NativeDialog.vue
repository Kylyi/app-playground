<script setup lang="ts" vapor>
import NativeDialogContent from './NativeDialogContent.vue'

const { dialogs, createDialog } = useDialog()
const message = ref('Native owner context')
provide('native-dialog-message', message)

function open() {
  createDialog({ title: 'Native programmatic dialog', noTransition: true, ignoreClickOutside: ['[data-native-dialog-controls]'] }, {
    children: { default: NativeDialogContent },
  })
}
</script>

<template>
  <div data-native-dialog-controls>
    <button
      data-testid="open-native-dialog"
      @click="open"
    >
      Open native dialog
    </button>
    <button
      data-testid="update-native-dialog"
      @click="message = 'Updated native context'"
    >
      Update native context
    </button>
  </div>
  <DialogHost :dialogs />
</template>
