<script setup lang="ts" vapor>
const step = ref<string>()
const hasProfileError = ref(false)
const ready = ref(false)
const stepper = useTemplateRef('stepper')

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="stepper-example"
    :data-ready="ready"
  >
    <Stepper
      ref="stepper"
      v-model="step"
      linear
      data-testid="stepper"
    >
      <Step
        name="account"
        label="Account"
        description="Sign-in details"
        icon="i-lucide:user"
      >
        <span data-testid="step-account">Account content</span>
      </Step>

      <Step
        name="profile"
        label="Profile"
        :error="hasProfileError"
      >
        <span data-testid="step-profile">Profile content</span>
      </Step>

      <Step
        name="done"
        label="Done"
      >
        <span data-testid="step-done">Done content</span>
      </Step>
    </Stepper>

    <button
      data-example-control
      @click="stepper?.next()"
    >
      Next step
    </button>
    <button
      data-example-control
      @click="stepper?.prev()"
    >
      Previous step
    </button>
    <button
      data-example-control
      @click="step = 'done'"
    >
      Set external step
    </button>
    <button
      data-example-control
      @click="hasProfileError = !hasProfileError"
    >
      Toggle profile error
    </button>
    <output
      data-example-output
      aria-label="Active step"
      data-testid="active-step"
    >{{ step ?? 'none' }}</output>
  </section>
</template>
