<script setup lang="ts" vapor>
const route = useRoute()
const localePath = useLocalePath()
const control = useTemplateRef('control')
const ready = ref(false)
const mounted = ref(true)
const linked = ref(false)
const disabled = ref(false)
const loading = ref(!!route.query.loading)
const clicks = ref(0)
const submits = ref(0)
const slotted = ref(false)
const rootTag = ref('')
onMounted(() => ready.value = true)

function focusControl() {
  control.value?.focus({ preventScroll: true })
  rootTag.value = control.value?.getElement()?.tagName ?? ''
}
</script>

<template>
  <section
    data-testid="button-example"
    :data-ready="ready"
  >
    <form @submit.prevent="submits++">
      <Btn
        v-if="mounted"
        ref="control"
        outlined
        data-testid="subject"
        :to="linked ? { path: localePath('/vapor-button'), query: { visited: 'true' } } : undefined"
        :disabled
        :loading
        :label="() => `Action ${clicks}`"
        preset="ADD"
        type="submit"
        ripple
        no-underline
        no-active-link
        :ui="{
          containerClass: ({ defaults }) => [defaults.all, 'custom-button'],
          labelStyle: () => ({ letterSpacing: '2px' }),
        }"
        @click="clicks++"
      >
        <template
          v-if="slotted"
          #icon
        >
          <span data-testid="custom-icon">+</span>
        </template>
        <template
          v-if="slotted"
          #label="{ style }"
        >
          <span
            data-testid="custom-label"
            :style
          >Custom label</span>
        </template>
        <span data-testid="default-content">Default content</span>
        <template #tooltip>
          Button tooltip
        </template>
      </Btn>
    </form>
    <button
      data-example-control
      @click="linked = !linked"
    >
      Toggle link
    </button>
    <button
      data-example-control
      @click="disabled = !disabled"
    >
      Toggle disabled
    </button>
    <button
      data-example-control
      @click="loading = !loading"
    >
      Toggle loading
    </button>
    <button
      data-example-control
      @click="slotted = !slotted"
    >
      Toggle slots
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle owner
    </button>
    <button
      data-example-control
      @click="focusControl"
    >
      Focus control
    </button>
    <output
      data-example-output
      aria-label="Root tag"
      data-testid="root-tag"
    >{{ rootTag }}</output>
    <output
      data-example-output
      aria-label="Clicks"
      data-testid="clicks"
    >{{ clicks }}</output>
    <output
      data-example-output
      aria-label="Submits"
      data-testid="submits"
    >{{ submits }}</output>
    <Btn
      outlined
      data-testid="external"
      label="External"
      to="https://example.com/"
      external
    />
    <Btn
      outlined
      data-testid="iconify"
      label="Iconify"
      icon="i-material-symbols:edit-rounded"
    />
    <Btn
      outlined
      data-testid="download"
      label="Download"
      to="/favicon.ico"
      download="icon.ico"
    />
    <Btn
      outlined
      data-testid="target"
      label="Target"
      :to="localePath('/vapor-button')"
      :navigate-to-options="{ open: { target: 'button-preview' } }"
    />
    <Btn
      outlined
      data-testid="replace"
      label="Replace route"
      :to="{ path: localePath('/vapor-button'), query: { replaced: 'true' } }"
      replace
    />
  </section>
</template>
