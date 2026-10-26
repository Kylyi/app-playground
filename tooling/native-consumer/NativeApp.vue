<script setup lang="ts" vapor>
import VaporTreeInitialization from '../../app/components/testing/VaporTreeInitialization.vue'
import VaporTreeDrag from '../../app/components/testing/VaporTreeDrag.vue'
import VaporTreeDmsDrop from '../../app/components/testing/VaporTreeDmsDrop.vue'
import VaporTabs from '../../app/components/testing/VaporTabs.vue'
import VaporScrollers from '../../app/components/testing/VaporScrollers.vue'
import VaporElementMovement from '../../app/components/testing/VaporElementMovement.vue'
import VaporMenuConfirmation from '../../app/components/testing/VaporMenuConfirmation.vue'
import TooltipHost from '../../packages/UI/app/components/Tooltip/TooltipHost.vue'
import Notifications from '../../packages/UI/app/components/Notification/Notifications.vue'
import NativeDialog from './NativeDialog.vue'
import VaporTableMeasurement from '../../app/components/testing/VaporTableMeasurement.vue'
import VaporTableEdit from '../../app/components/testing/VaporTableEdit.vue'
import VaporTablePivotDom from '../../app/components/testing/VaporTablePivotDom.vue'
import VaporQueryBuilderDom from '../../app/components/testing/VaporQueryBuilderDom.vue'
import VaporSelectorHost from '../../app/components/testing/VaporSelectorHost.vue'
import VaporValueContracts from '../../app/components/testing/VaporValueContracts.vue'
import VaporDateTimeFullInput from '../../app/components/testing/VaporDateTimeFullInput.vue'
import VaporTabsAccessibility from '../../app/components/testing/VaporTabsAccessibility.vue'
import VaporScrollerContracts from '../../app/components/testing/VaporScrollerContracts.vue'
import VaporNativeLinks from '../../app/components/testing/VaporNativeLinks.vue'
import VaporRuntimeIcons from '../../app/components/testing/VaporRuntimeIcons.vue'
import VaporConsumerContracts from '../../app/components/testing/VaporConsumerContracts.vue'
import VaporCollapseContracts from '../../app/components/testing/VaporCollapseContracts.vue'
import VaporPivotWorker from '../../app/components/testing/VaporPivotWorker.vue'
import VaporOverflow from '../../app/components/testing/VaporOverflow.vue'
import LinkDestination from '../../app/pages/vapor-native-links-target.vue'

const family = useRoute().query.family ?? 'tree'
const overflowReports = ref(0)
const router = useRouter()
const isLinkDestination = computed(() => router.currentRoute.value.path.endsWith('/vapor-native-links-target'))
// Keeping every exported SFC in the graph makes the bundle audit cover the
// whole library, including families mounted by separate browser scenarios.
const components = import.meta.glob('../../packages/UI/app/components/**/*.vue', { eager: true, import: 'default' })
const inventory = Object.values(components)
const nativeCount = inventory.filter(component => {
  return (typeof component === 'function' || (typeof component === 'object' && component !== null))
    && '__vapor' in component && component.__vapor === true
}).length
</script>

<template>
  <main>
    <h1>Native Vapor consumer</h1>
    <output data-testid="native-inventory">{{ nativeCount }}/{{ inventory.length }}</output>
    <button data-testid="unmount-native-app">
      Unmount native app
    </button>
    <TooltipHost />
    <Notifications />
    <LinkDestination v-if="isLinkDestination" />
    <VaporNativeLinks v-else-if="family === 'links'" />
    <VaporRuntimeIcons v-else-if="family === 'icons'" />
    <VaporConsumerContracts v-else-if="family === 'contracts'" />
    <VaporCollapseContracts v-else-if="family === 'collapse'" />
    <VaporOverflow
      v-else-if="family === 'overflow'"
      :on-report="() => overflowReports++"
    />
    <VaporPivotWorker v-else-if="family === 'pivot-worker'" />
    <VaporTreeInitialization v-else-if="family === 'tree'" />
    <VaporTreeDrag v-else-if="family === 'drag'" />
    <VaporTreeDmsDrop v-else-if="family === 'dms'" />
    <VaporTabs v-else-if="family === 'tabs'" />
    <VaporTabsAccessibility v-else-if="family === 'tabs-keyboard'" />
    <VaporScrollerContracts v-else-if="family === 'scroller-contracts'" />
    <VaporScrollers v-else-if="family === 'scroller'" />
    <VaporElementMovement v-else-if="family === 'movement'" />
    <VaporMenuConfirmation v-else-if="family === 'confirmation'" />
    <NativeDialog v-else-if="family === 'dialog'" />
    <VaporTableMeasurement v-else-if="family === 'measurement'" />
    <VaporTableEdit v-else-if="family === 'edit'" />
    <VaporTablePivotDom v-else-if="family === 'pivot'" />
    <VaporQueryBuilderDom v-else-if="family === 'query'" />
    <VaporSelectorHost v-else-if="family === 'selector'" />
    <VaporValueContracts v-else-if="family === 'values'" />
    <VaporDateTimeFullInput v-else-if="family === 'datetime'" />
  </main>
</template>
