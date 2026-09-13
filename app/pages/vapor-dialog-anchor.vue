<script setup lang="ts">
import VaporDialogAnchor from '../components/testing/VaporDialogAnchor.vue'

const target = ref<string>()
const manual = ref(false)
const contextMenu = ref(false)
const mounted = ref(true)
const toggles = ref(0)
const dialog = ref(false)
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <main
    :data-ready="ready"
    data-testid="dialog-anchor-page"
  >
    <p class="example-intro">
      Choose an anchor, then activate it to change the dialog state.
      Use the controls below to try manual mode, right-click, and owner cleanup.
    </p>
    <section class="anchor-section">
      <h2>1. Try the anchors</h2>
      <p>Initially either target works. Use A or Use B to listen to only one target.</p>
      <div data-testid="native-host">
        <button
          id="anchor-a"
          data-example-control
        >
          Target A
        </button>
        <button
          id="anchor-b"
          data-example-control
        >
          Target B
        </button>
        <VaporDialogAnchor
          v-if="mounted"
          :target
          :manual
          :trigger="contextMenu ? 'contextmenu' : 'click'"
          :on-toggle="() => toggles++"
        />
      </div>
      <output
        data-example-output
        aria-label="Native toggles"
        data-testid="native-toggles"
      >{{ toggles }}</output>
    </section>
    <section class="anchor-section">
      <h2>2. Configure behavior</h2>
      <p>Manual mode stops anchor events. Right-click mode uses the context menu event.</p>
      <button
        data-example-control
        :aria-pressed="target === '#anchor-a'"
        @click="target = '#anchor-a'"
      >
        Use A
      </button>
      <button
        data-example-control
        :aria-pressed="target === '#anchor-b'"
        @click="target = '#anchor-b'"
      >
        Use B
      </button>
      <button
        data-example-control
        :aria-pressed="manual"
        @click="manual = !manual"
      >
        Toggle manual
      </button>
      <button
        data-example-control
        :aria-pressed="contextMenu"
        @click="contextMenu = !contextMenu"
      >
        Toggle event
      </button>
      <button
        data-example-control
        :aria-pressed="mounted"
        @click="mounted = !mounted"
      >
        Toggle owner
      </button>
      <div
        class="anchor-state"
        aria-live="polite"
      >
        <span>Anchor: <strong>{{ target ? target.replace('#anchor-', '').toUpperCase() : 'A + B' }}</strong></span>
        <span>Mode: <strong>{{ manual ? 'Manual' : 'Automatic' }}</strong></span>
        <span>Event: <strong>{{ contextMenu ? 'Right-click' : 'Click' }}</strong></span>
        <span>Owner: <strong>{{ mounted ? 'Mounted' : 'Unmounted' }}</strong></span>
      </div>
    </section>
    <section class="anchor-section">
      <h2>3. Open a real dialog</h2>
      <p>Open the dialog, then close it to see its model update.</p>
      <button
        data-example-control
        data-testid="real-dialog-trigger"
      >
        Open actual dialog
        <Dialog
          v-model="dialog"
          no-transition
          no-overlay
        >
          <template #default="{ hide }">
            <button
              data-example-control
              data-testid="real-dialog-close"
              @click="hide()"
            >
              Close actual dialog
            </button>
          </template>
        </Dialog>
      </button>
      <output
        data-example-output
        aria-label="Real dialog model"
        data-testid="real-dialog-model"
      >{{ dialog }}</output>
    </section>
  </main>
</template>

<style scoped>
.example-intro {
  max-width: 70ch;
  margin-bottom: 24px;
  line-height: 1.7;
}

.anchor-section + .anchor-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--example-border);
}

.anchor-section h2 {
  margin-bottom: 6px;
  font-size: 16px;
  font-weight: 600;
}

.anchor-section p {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.8;
}

.anchor-state {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 12px;
  font-size: 13px;
}
</style>
