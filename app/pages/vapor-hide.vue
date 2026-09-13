<script setup lang="ts" vapor>
import Dialog from '../../packages/UI/app/components/Dialog/Dialog.vue'
import Menu from '../../packages/UI/app/components/Menu/Menu.vue'

const dialog = ref(false)
const outer = ref(false)
const inner = ref(false)
const persistent = ref(false)
const ready = ref(false)

const dialogTarget = useTemplateRef<HTMLSpanElement>('dialogTarget')
const outerTarget = useTemplateRef<HTMLSpanElement>('outerTarget')
const innerTarget = useTemplateRef<HTMLSpanElement>('innerTarget')

// The public helper must also be safe during SSR, before any DOM exists.
$hide()

onMounted(() => {
  ready.value = true
})

async function open() {
  dialog.value = true
  await nextTick()
  outer.value = true
  await nextTick()
  inner.value = true
}
</script>

<template>
  <main
    data-testid="hide-fixture"
    :data-ready="ready"
    flex="~ col gap-1"
    w="72"
  >
    <button
      data-example-control
      @click="open"
    >
      Open overlays
    </button>

    <button
      data-example-control
      @click="persistent = !persistent"
    >
      Toggle persistent
    </button>

    <button
      data-example-control
      @click="$hide()"
    >
      Hide latest
    </button>

    <button
      data-example-control
      @click="$hide({ target: outerTarget })"
    >
      Hide outer target
    </button>

    <button
      data-example-control
      @click="$hide({ target: innerTarget })"
    >
      Hide inner target
    </button>

    <button
      data-example-control
      @click="$hide({ target: dialogTarget })"
    >
      Hide dialog target
    </button>

    <button
      data-example-control
      @click="$hide({ target: null })"
    >
      Hide missing target
    </button>

    <button
      data-example-control
      @click="$hide({ all: true })"
    >
      Hide all
    </button>

    <button
      data-example-control
      @click="$hide({ all: true, force: true })"
    >
      Force all
    </button>

    <button
      data-example-control
      @click="$hide({ all: true, type: 'menu' })"
    >
      Hide menus
    </button>

    <button
      data-example-control
      @click="$hide({ type: 'dialog' })"
    >
      Hide latest dialog
    </button>

    <button
      data-example-control
      @click="$hide({ all: true, ignore: [outerTarget!.closest('.floating-element')!] })"
    >
      Keep outer
    </button>

    <button
      data-example-control
      @click="$hide({ ignore: [innerTarget!.closest('.floating-element')!] })"
    >
      Ignore latest
    </button>

    <button
      data-example-control
      @click="$hide({
        all: true,
        ignore: [innerTarget!.closest('.floating-element')!],
        ignoreUntilEl: outerTarget!.closest('.floating-element'),
      })"
    >
      Hide after outer
    </button>

    <output
      data-example-output
      aria-label="Hide models"
      data-testid="hide-models"
    >{{ dialog }}/{{ outer }}/{{ inner }}</output>

    <Dialog
      v-model="dialog"
      position="right"
      :ui="{ dialogStyle: () => ({ width: '240px', height: '120px' }) }"
      :persistent
      :ignore-click-outside="['button']"
      manual
      no-overlay
      no-transition
      no-bounce
    >
      <span ref="dialogTarget">Dialog content</span>
    </Dialog>

    <Menu
      v-model="outer"
      :persistent
      :ignore-click-outside="['button']"
      :target="dialogTarget"
      :reference-target="dialogTarget"
      manual
      no-overlay
      no-uplift
      no-transition
      no-bounce
    >
      <span ref="outerTarget">Outer menu content</span>
    </Menu>

    <Menu
      v-model="inner"
      :persistent
      :ignore-click-outside="['button']"
      :target="outerTarget"
      :reference-target="outerTarget"
      manual
      no-overlay
      no-uplift
      no-transition
      no-bounce
    >
      <span ref="innerTarget">Inner menu content</span>
    </Menu>
  </main>
</template>
