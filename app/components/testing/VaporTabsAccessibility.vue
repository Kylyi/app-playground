<script setup lang="ts" vapor>
import type { ITabProps } from '#layers/ui/app/components/Tabs/types/tab-props.type'

const automatic = useRoute().query.mode === 'automatic'
const selected = ref<string | number>('alpha')
const secondary = ref<string | number>('alpha')
const ready = ref(false)
const mounted = ref(true)
const gamma = ref(true)
const reversed = ref(false)
const renamed = ref(false)
const alphaDisabled = ref(false)
const tabs = computed<ITabProps[]>(() => {
  const items: ITabProps[] = [
    { name: 'alpha', label: renamed.value ? 'Renamed Alpha' : 'Alpha', btnProps: () => ({ disabled: alphaDisabled.value }) },
    { name: 'beta', label: 'Beta', btnProps: () => ({ disabled: true }) },
    ...(gamma.value ? [{ name: 'gamma', label: 'Gamma' }] : []),
    { name: 'delta', label: 'Delta' },
  ]

  return reversed.value ? items.reverse() : items
})

function removeFocused(event: KeyboardEvent) {
  if ((event.target as HTMLElement).getAttribute('role') === 'tab' && selected.value === 'gamma') {
    gamma.value = false
  }
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="accessible-tabs"
    :data-ready="ready"
    flex="~ col gap-4"
    @keydown.stop
    @keydown.delete="removeFocused"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        @click="reversed = !reversed"
      >
        Reverse accessible tabs
      </button>
      <button
        data-example-control
        @click="renamed = !renamed"
      >
        Rename accessible Alpha
      </button>
      <button
        data-example-control
        @click="alphaDisabled = !alphaDisabled"
      >
        Toggle Alpha disabled
      </button>
      <button
        data-example-control
        @click="mounted = !mounted"
      >
        Toggle accessible owner
      </button>
    </div>
    <output
      data-example-output
      data-testid="accessible-selection"
      aria-label="Selected accessible tab"
    >{{ selected }}</output>
    <button
      data-example-control
      data-testid="before-tabs"
      tabindex="0"
    >
      Before tabs
    </button>
    <Tabs
      v-if="mounted"
      v-model="selected"
      data-testid="keyboard-tabs"
      navigation-label="Project sections"
      :activation-mode="automatic ? 'automatic' : 'manual'"
      :keep-alive-props="{ max: 3 }"
      :ui="{ containerStyle: () => ({ maxWidth: '320px' }), tabNavBtnStyle: () => ({ minWidth: '100px' }) }"
    >
      <Tab
        v-for="tab in tabs"
        :key="tab.name"
        v-bind="tab"
      >
        <p>{{ tab.name }} panel introduction</p>
        <button
          data-example-control
          :data-testid="`action-${tab.name}`"
          tabindex="0"
        >
          Action {{ tab.name }}
        </button>
      </Tab>
    </Tabs>
    <button
      data-example-control
      data-testid="after-tabs"
      tabindex="0"
    >
      After tabs
    </button>
    <Tabs
      v-model="secondary"
      data-testid="custom-label-tabs"
    >
      <template #navigation="{ tabs: navigation, ui }">
        <TabsNavigation
          v-model="secondary"
          :tabs="navigation"
          :ui
          label="Custom sections"
        >
          <template #alpha-label="{ btnProps }">
            <Btn
              label="Custom Alpha"
              v-bind="btnProps"
            />
          </template>
        </TabsNavigation>
      </template>
      <Tab
        name="alpha"
        label="Alpha"
      >
        Secondary Alpha content
      </Tab>
      <Tab
        name="gamma"
        label="Gamma"
      >
        Secondary Gamma content
      </Tab>
    </Tabs>
  </section>
</template>
