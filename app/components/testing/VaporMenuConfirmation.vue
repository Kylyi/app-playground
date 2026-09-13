<script setup lang="ts" vapor>
const menu = useTemplateRef('menu')
const link = useTemplateRef('link')
const mounted = ref(true)
const ready = ref(false)
const confirmed = ref(false)
const keepOpen = ref(false)
const confirmations = ref(0)
const hides = ref(0)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="menu-confirmation"
    :data-ready="ready"
  >
    <div>
      <button
        data-example-control
        @click="menu?.show()"
      >
        Open confirmation
      </button>
      <MenuConfirmation
        v-if="mounted"
        ref="menu"
        v-model="confirmed"
        manual
        focus-confirm-button
        no-transition
        no-overlay
        no-uplift
        :has-confirmation="keepOpen"
        confirmation-text="Confirm this action"
        @ok="confirmations++"
        @hide="hides++"
      >
        <template #append>
          <p
            v-if="confirmed"
            data-testid="confirmed-message"
          >
            Confirmed
          </p>
        </template>
      </MenuConfirmation>
    </div>
    <button
      data-example-control
      @click="keepOpen = !keepOpen"
    >
      Toggle second stage
    </button>
    <button
      data-example-control
      @click="menu?.focusConfirmButton()"
    >
      Focus confirm
    </button>
    <button
      data-example-control
      @click="menu?.hide()"
    >
      Close confirmation
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle confirmation owner
    </button>
    <output
      data-example-output
      aria-label="Confirmation count"
      data-testid="confirmation-count"
    >{{ confirmations }}</output>
    <output
      data-example-output
      aria-label="Confirmation state"
      data-testid="confirmation-state"
    >{{ confirmed }}</output>
    <output
      data-example-output
      aria-label="Confirmation hides"
      data-testid="confirmation-hides"
    >{{ hides }}</output>
    <Btn
      ref="link"
      outlined
      label="Example link"
      to="/vapor-menu-confirmation"
    />
    <button
      data-example-control
      @click="link?.focus()"
    >
      Focus link
    </button>
  </section>
</template>
