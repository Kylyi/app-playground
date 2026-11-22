import type { ComputedRef, InjectionKey, Ref } from 'vue'

// Types
import type {
  ITimelineComposableProps,
  ITimelineComposableValue,
} from '../types/timeline-composable-props.type'

// Constants
import { TIMELINE_COMPOSABLE_DEFAULT_PROPS } from '../constants/timeline-composable-default-props.constant'

type IUi = typeof TIMELINE_COMPOSABLE_DEFAULT_PROPS['ui']
type IUiClassKey = keyof IUi

/**
 * Item order without registration: the order (index, first / last, progress) is read from the DOM ~ the `li`
 * children of the list. It follows keyed `v-for` moves, conditional items and wrapper components for free,
 * and costs one `children` read per child-list mutation (not per item, not per content change)
 *
 * The items only publish their `value` (a reactive `Map` keyed by their element), so the timeline can find the
 * index of the current item and step through the values (`next` / `prev`)
 */
export function useTimelineComposable(
  props: ITimelineComposableProps,
  model: Ref<ITimelineComposableValue | null | undefined>,
  listEl: Ref<HTMLElement | undefined>,
) {
  const itemEls = shallowRef<Element[]>([])
  const values = shallowReactive(new Map<Element, ITimelineComposableValue | undefined>())

  function syncItems() {
    const children = listEl.value ? [...listEl.value.children] : []
    const hasChanged = children.length !== itemEls.value.length
      || children.some((el, idx) => el !== itemEls.value[idx])

    if (hasChanged) {
      itemEls.value = children
    }
  }

  const indexByEl = computed(() => new Map(itemEls.value.map((el, idx) => [el, idx])))
  const count = computed(() => itemEls.value.length)
  const hasProgress = computed(() => model.value !== undefined)

  const activeIndex = computed(() => {
    if (model.value === undefined || model.value === null) {
      return -1
    }

    return itemEls.value.findIndex(el => values.get(el) === model.value)
  })

  function select(value?: ITimelineComposableValue) {
    if (value === undefined || props.disabled) {
      return false
    }

    model.value = value

    return true
  }

  function step(direction: 1 | -1) {
    const idx = activeIndex.value + direction
    const value = itemEls.value[idx] && values.get(itemEls.value[idx])

    if (value !== undefined) {
      model.value = value
    }
  }

  // Class strings depend only on the timeline-wide props, so they are computed once for all items
  const classes = computed(() => {
    const orientation = props.orientation ?? 'vertical'
    const side = props.side ?? 'end'
    const size = props.size ?? 'md'
    const { ui: defaults } = TIMELINE_COMPOSABLE_DEFAULT_PROPS

    const payloads: { [K in IUiClassKey]: Parameters<IUi[K]>[0] } = {
      containerClass: { orientation, size },
      listClass: { orientation, side },
      itemClass: { orientation },
      railClass: { orientation },
      markerClass: { size },
      dotClass: undefined,
      iconClass: { size },
      connectorClass: { orientation },
      contentClass: { orientation },
      oppositeClass: { orientation, size },
      headerClass: { orientation },
      titleClass: { size },
      timeClass: { size },
      descriptionClass: { size },
      expandIconClass: undefined,
      bodyClass: { size },
    }

    return Object.fromEntries(
      (Object.keys(defaults) as IUiClassKey[]).map(key => {
        const defaultClasses = (defaults[key] as (payload: any) => { all: string })(payloads[key])
        const override = props.ui?.[key] as ((payload: { defaults: any }) => ClassType) | undefined

        return [key, override ? override({ defaults: defaultClasses }) : defaultClasses.all]
      }),
    ) as Record<IUiClassKey, ClassType>
  })

  return {
    itemEls,
    values,
    indexByEl,
    count,
    hasProgress,
    activeIndex,
    classes,
    syncItems,
    select,
    next: () => step(1),
    prev: () => step(-1),
  }
}

export type ITimelineComposableContext = {
  values: Map<Element, ITimelineComposableValue | undefined>
  indexByEl: ComputedRef<Map<Element, number>>
  count: ComputedRef<number>
  hasProgress: ComputedRef<boolean>
  activeIndex: ComputedRef<number>
  model: Ref<ITimelineComposableValue | null | undefined>
  classes: ComputedRef<Record<IUiClassKey, ClassType>>
  props: ITimelineComposableProps
  select: (value?: ITimelineComposableValue) => void
}

export const timelineComposableContextKey: InjectionKey<ITimelineComposableContext> = Symbol('timelineComposable')
