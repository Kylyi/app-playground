import type { CSSProperties } from 'vue'

// Constants
import type {
  ITimelineComposableColor,
  ITimelineComposableOrientation,
  ITimelineComposableSide,
  ITimelineComposableSize,
  TIMELINE_COMPOSABLE_DEFAULT_PROPS,
} from '../constants/timeline-composable-default-props.constant'

export type ITimelineComposableValue = string | number

export type ITimelineComposableStatus = 'default' | 'completed' | 'active' | 'upcoming' | 'error' | 'pending'

export type ITimelineComposableMarker = 'auto' | 'dot' | 'number'

export type ITimelineComposableLineStyle = 'solid' | 'dashed' | 'dotted'

type IUi = typeof TIMELINE_COMPOSABLE_DEFAULT_PROPS['ui']

/**
 * Every `xxxClass` receives the default classes and returns the classes to use (`[defaults.all, 'my-class']` to extend)
 */
export type ITimelineComposableUi = {
  [K in keyof IUi]?: (payload: { defaults: ReturnType<IUi[K]> }) => ClassType
} & {
  /**
   * Style to apply to the container
   */
  containerStyle?: () => CSSProperties

  /**
   * Style to apply to each item (`li`)
   */
  itemStyle?: () => CSSProperties
}

export type ITimelineComposableProps = {
  /**
   * Value of the current item ~ enables the progress semantics: items before it are `completed`,
   * the item itself is `active` (`aria-current`), the following ones are `upcoming`
   *
   * NOTE: `undefined` disables the progress (all items use their own color), `null` means "not started"
   * (all items are `upcoming`)
   */
  modelValue?: ITimelineComposableValue | null

  /**
   * The orientation of the timeline
   *
   * NOTE: The `horizontal` timeline scrolls when its items do not fit
   *
   * @default 'vertical'
   */
  orientation?: ITimelineComposableOrientation

  /**
   * On which side of the line the item's content is placed, the opposite side holds the `time` (see `timePlacement`)
   * and the `opposite` slot
   *
   * NOTE: `start` = left / top, `end` = right / bottom, `alternate` switches the side for every item
   *
   * @default 'end'
   */
  side?: ITimelineComposableSide

  /**
   * Where the item's `time` is rendered ~ next to the title, or on the opposite side of the line
   *
   * @default 'inline'
   */
  timePlacement?: 'inline' | 'opposite'

  /**
   * The size of the markers, texts and spacing
   *
   * @default 'md'
   */
  size?: ITimelineComposableSize

  /**
   * The default marker of the items
   *
   * - `auto` ~ the item's icon when provided, a dot otherwise
   * - `dot` ~ always a dot
   * - `number` ~ the item's position (1-based)
   *
   * @default 'auto'
   */
  marker?: ITimelineComposableMarker

  /**
   * The default color of the items, a theme color name or any CSS color
   *
   * @default 'primary'
   */
  color?: ITimelineComposableColor | (string & {})

  /**
   * The style of the line connecting the markers
   *
   * @default 'solid'
   */
  lineStyle?: ITimelineComposableLineStyle

  /**
   * The thickness of the line in pixels
   *
   * @default 2
   */
  lineWidth?: number

  /**
   * The minimal width of an item in the `horizontal` orientation (any CSS length)
   *
   * @default '12rem'
   */
  itemWidth?: string

  /**
   * Whether the items can be clicked to select them (sets the `modelValue`, emits `select`)
   *
   * NOTE: Only items with a `value` can be selected
   */
  clickable?: boolean

  /**
   * Whether the items' content (default slot) can be collapsed by clicking on their header
   *
   * NOTE: Each item can override it with its own `collapsible` prop
   */
  collapsible?: boolean

  /**
   * Whether all items are disabled (not clickable)
   */
  disabled?: boolean

  /**
   * Whether the timeline is loading ~ renders `skeletonCount` skeleton items instead of the default slot
   */
  loading?: boolean

  /**
   * The number of skeleton items rendered while `loading`
   *
   * @default 3
   */
  skeletonCount?: number

  /**
   * Appends a pending item (spinner marker) at the end of the timeline, a string is used as its title
   */
  pending?: boolean | string

  /**
   * The icon shown in the marker of a completed item (instead of its icon / number)
   *
   * NOTE: An Iconify name (`lucide:check`) or a UnoCSS icon class (`i-lucide:check`), like `Btn`'s `icon`
   */
  completedIcon?: string

  /**
   * The icon shown in the marker of an item in the `error` status
   */
  errorIcon?: string

  /**
   * The icon shown in the marker of a `pending` item
   *
   * @default 'i-svg-spinners:ring-resize'
   */
  pendingIcon?: string

  /**
   * The icon of the expand indicator of collapsible items
   *
   * @default 'i-lucide:chevron-down'
   */
  expandIcon?: string

  /**
   * Whether the `horizontal` timeline scrolls the active item into view when the `modelValue` changes
   *
   * @default true
   */
  scrollToActive?: boolean

  /**
   * Visual configuration
   *
   * NOTE: Use the `is-completed`, `is-active`, `is-upcoming`, `is-error`, `is-pending`, `is-default`,
   * `is-side-start`, `is-side-end`, `is-first`, `is-last`, `is-disabled`, `is-clickable`, `is-collapsible`,
   * `is-expanded`, `is-dot`, `is-dashed` and `is-dotted` CSS selectors for state styling
   */
  ui?: ITimelineComposableUi
}
