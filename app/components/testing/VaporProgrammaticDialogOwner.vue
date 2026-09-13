<script setup lang="ts" vapor>
import DialogInjectedContent, { LegacyDialogContent, LegacyDialogHeader } from './DialogInjectedContent.vue'

const props = defineProps<{ onHidden: () => void }>()
const message = ref('Owner context')
const allowClose = ref(true)
const closeAttempts = ref(0)
provide('programmatic-dialog-message', message)
const { dialogs, createDialog } = useDialog()
const closeLast = shallowRef<() => void>()
const target = useTemplateRef<HTMLButtonElement>('target')

function open(legacy = false) {
  const handle = createDialog({
    title: legacy ? 'Legacy content' : 'Declarative content',
    onHide: props.onHidden,
    beforeHideFnc: () => {
      closeAttempts.value++

      return allowClose.value
    },
    ignoreClickOutside: ['[data-dialog-controls]'],
    ui: {
      wrapperStyle: () => ({ alignItems: 'center', justifyContent: 'center' }),
      dialogStyle: () => ({ width: '320px', height: 'auto' }),
    },
  }, {
    elRef: target,
    children: legacy ? { default: LegacyDialogContent, header: LegacyDialogHeader } : undefined,
  })
  closeLast.value = handle?.close
}
</script>

<template>
  <div
    data-dialog-controls
    flex="~ col gap-3"
  >
    <button
      ref="target"
      data-example-control
      @click="open()"
    >
      Open declarative dialog
    </button>
    <button
      data-example-control
      @click="open(true)"
    >
      Open legacy content
    </button>
    <button
      data-example-control
      @click="message = 'Updated owner context'"
    >
      Update context
    </button>
    <button
      data-example-control
      @click="closeLast?.()"
    >
      Close last dialog
    </button>
    <button
      data-example-control
      @click="allowClose = !allowClose"
    >
      Toggle close permission
    </button>
    <output
      data-example-output
      aria-label="Close attempts"
      data-testid="close-attempts"
    >{{ closeAttempts }}</output>
    <output
      data-example-output
      aria-label="Dialog count"
      data-testid="dialog-count"
    >{{ dialogs.length }}</output>
    <DialogHost :dialogs>
      <template #default="{ hide }">
        <DialogInjectedContent />
        <button
          data-example-control
          @click="hide()"
        >
          Close through slot
        </button>
      </template>
    </DialogHost>
  </div>
</template>
