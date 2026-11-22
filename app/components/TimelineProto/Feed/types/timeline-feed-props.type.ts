import type { CSSProperties } from 'vue'

// Constants
import type { TIMELINE_FEED_DEFAULT_PROPS } from '../constants/timeline-feed-default-props.constant'

export type ITimelineFeedSize = 'xs' | 'sm' | 'md' | 'lg'
export type ITimelineFeedSide = 'start' | 'end' | 'alternate'
export type ITimelineFeedMarker = 'auto' | 'dot' | 'icon' | 'avatar' | 'number'
export type ITimelineFeedVariant = 'filled' | 'outline' | 'soft'
export type ITimelineFeedConnector = 'solid' | 'dashed' | 'dotted'

/**
 * Theme colors resolve to the `--color-*` CSS variables, anything else is used as a raw CSS color
 */
export type ITimelineFeedColor
  = | 'primary'
    | 'secondary'
    | 'positive'
    | 'negative'
    | 'warning'
    | 'info'
    | 'neutral'
    | (string & {})

export type ITimelineFeedItem = {
  /**
   * Unique identifier, used as the `key`
   */
  id: string | number

  /**
   * Title of the item
   */
  title?: string

  /**
   * Description of the item, shown below the title
   */
  description?: string

  /**
   * Human-readable time of the item (`2 hours ago`, `12. 3. 2026`)
   *
   * NOTE: Rendered in the opposite column when `opposite` is enabled, next to the title otherwise
   */
  time?: string

  /**
   * Machine-readable time for the `<time datetime>` attribute
   */
  datetime?: string

  /**
   * Icon shown in the marker
   *
   * NOTE: An Iconify name (`lucide:user`) or a UnoCSS icon class (`i-lucide:user`), like `Btn`'s `icon`
   */
  icon?: string

  /**
   * Image URL shown in the marker
   */
  avatar?: string

  /**
   * Color of the marker (and of the connector when `connectorColor` is `item`)
   */
  color?: ITimelineFeedColor

  /**
   * Overrides the timeline's `marker` for this item
   */
  marker?: ITimelineFeedMarker

  /**
   * Overrides the timeline's `variant` for this item
   */
  variant?: ITimelineFeedVariant

  /**
   * Pins the item to a side when the timeline's `side` is `alternate`
   */
  side?: 'start' | 'end'

  /**
   * The item is in progress ~ a spinner in the marker and dashed connectors around it
   */
  pending?: boolean

  /**
   * The item is greyed out (e.g. a planned / upcoming event)
   */
  muted?: boolean

  /**
   * Name of the slot used to render this item's content instead of the `content` slot
   */
  slot?: string
}

export type ITimelineFeedProps<T extends ITimelineFeedItem = ITimelineFeedItem> = {
  /**
   * Color of the markers, items can override it with their own `color`
   *
   * @default 'primary'
   */
  color?: ITimelineFeedColor

  /**
   * Style of the line between markers
   *
   * NOTE: Connectors next to a pending item are always dashed
   *
   * @default 'solid'
   */
  connector?: ITimelineFeedConnector

  /**
   * Color of the line between markers
   * - `neutral`: grey
   * - `item`: the color of the item the line belongs to
   *
   * @default 'neutral'
   */
  connectorColor?: 'neutral' | 'item'

  /**
   * Compact spacing between items, the description is clamped to one line
   */
  dense?: boolean

  /**
   * The items to render
   */
  items: T[]

  /**
   * What is rendered in the marker
   * - `auto`: the avatar, then the icon, then a dot ~ based on what the item has
   * - `dot`, `icon`, `avatar`, `number`: always that (icon / avatar fall back to a dot when the item has none)
   *
   * NOTE: With a `#marker` slot, the marker has the full size unless `dot` is used
   *
   * @default 'auto'
   */
  marker?: ITimelineFeedMarker

  /**
   * Vertical alignment of the marker against the item's content
   * - `start`: aligned with the title
   * - `center`: centered against the whole item
   *
   * @default 'start'
   */
  markerAlign?: 'start' | 'center'

  /**
   * Show the item's `time` (or the `opposite` slot) on the other side of the line
   */
  opposite?: boolean

  /**
   * Appends a pending item at the end of the list, a string is used as its title
   */
  pending?: boolean | string

  /**
   * Icon of the pending item's marker
   *
   * @default 'i-lucide:loader-circle'
   */
  pendingIcon?: string

  /**
   * Render the items (including the pending one) in reverse order, e.g. newest first
   */
  reverse?: boolean

  /**
   * Which side of the line the content is on
   * - `end`: line at the start, content after it (the usual feed)
   * - `start`: content before the line, right-aligned
   * - `alternate`: centered line, items alternate between sides
   *
   * @default 'end'
   */
  side?: ITimelineFeedSide

  /**
   * The size of the timeline
   *
   * @default 'md'
   */
  size?: ITimelineFeedSize

  /**
   * How the marker is filled
   *
   * @default 'filled'
   */
  variant?: ITimelineFeedVariant

  /**
   * Visual configuration
   *
   * NOTE: State classes are applied to the item and all its parts: `is-start` / `is-end` (content side),
   * `is-first`, `is-last`, `is-pending`, `is-muted`, `is-dot` / `is-icon` / `is-avatar` / `is-number` / `is-custom`, `is-filled` / `is-outline` / `is-soft`.
   * Each item also gets the `--tl-color` CSS variable with its resolved color
   */
  ui?: {
    /**
     * Class to apply to the container (`ol`)
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container (`ol`)
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to each item (`li`)
     */
    itemClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['itemClass']>
    }) => ClassType

    /**
     * Style to apply to each item (`li`)
     */
    itemStyle?: (payload: { item: T, idx: number }) => CSSProperties

    /**
     * Class to apply to the opposite column
     */
    oppositeClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['oppositeClass']>
    }) => ClassType

    /**
     * Class to apply to the rail (the column holding the marker and connectors)
     */
    railClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['railClass']>
    }) => ClassType

    /**
     * Class to apply to the marker
     */
    markerClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['markerClass']>
    }) => ClassType

    /**
     * Class to apply to the icon inside the marker
     */
    iconClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['iconClass']>
    }) => ClassType

    /**
     * Class to apply to the connector segments (above and below the marker)
     */
    connectorClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['connectorClass']>
    }) => ClassType

    /**
     * Class to apply to the content column
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Class to apply to the header (the title and the inline time)
     */
    headerClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['headerClass']>
    }) => ClassType

    /**
     * Class to apply to the title
     */
    titleClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['titleClass']>
    }) => ClassType

    /**
     * Class to apply to the time
     */
    timeClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['timeClass']>
    }) => ClassType

    /**
     * Class to apply to the description
     */
    descriptionClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['descriptionClass']>
    }) => ClassType

    /**
     * Class to apply to the wrapper of the `content` slot (rich content below the description)
     */
    bodyClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_FEED_DEFAULT_PROPS['ui']['bodyClass']>
    }) => ClassType
  }
}

export type ITimelineFeedSlotProps<T extends ITimelineFeedItem = ITimelineFeedItem> = {
  item: T

  /**
   * Position in the rendered list
   */
  idx: number

  /**
   * Position in the `items` array (stable when `reverse` is used), `-1` for the pending item
   */
  originalIdx: number

  /**
   * Which side of the line the content is on
   */
  side: 'start' | 'end'
  isFirst: boolean
  isLast: boolean
}
