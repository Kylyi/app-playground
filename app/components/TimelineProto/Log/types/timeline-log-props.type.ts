import type { CSSProperties } from 'vue'

// Constants
import type { TIMELINE_LOG_DEFAULT_PROPS } from '../constants/timeline-log-default-props.constant'

/**
 * A single entry of the log
 *
 * NOTE: Any extra fields are kept and passed to the slots (the component is generic over the item type)
 */
export type ITimelineLogItem = {
  /**
   * Unique identifier, used as the `key` (see `itemKey`)
   */
  id?: string | number

  /**
   * When the event happened, anything `$date` can parse (ISO string, timestamp, Date, Dayjs)
   */
  date: Datetime

  /**
   * The kind of the event, looked up in `types` for the icon, color and label
   */
  type?: string

  /**
   * Main text of the entry
   */
  title: string

  /**
   * Secondary text, shown below the title in the `card` layout (and as a tooltip in the `compact` layout)
   */
  description?: string

  /**
   * Who did it (user, system, ...)
   */
  actor?: string

  /**
   * Overrides the icon of the item's type
   *
   * NOTE: An Iconify name (`lucide:user`) or a UnoCSS icon class (`i-lucide:user`)
   */
  icon?: string

  /**
   * Overrides the color of the item's type
   *
   * NOTE: A theme color name (`primary`, `positive`, ...) or any CSS color
   */
  color?: string
}

/**
 * Visual definition of an item kind
 */
export type ITimelineLogType = {
  /**
   * An Iconify name (`lucide:user`) or a UnoCSS icon class (`i-lucide:user`)
   *
   * NOTE: UnoCSS icon classes are pure CSS, so they are cheaper with large lists
   */
  icon?: string

  /**
   * A theme color name (`primary`, `positive`, ...) or any CSS color
   */
  color?: string

  /**
   * Human readable name of the kind (used for the marker's accessible label)
   */
  label?: string
}

export type ITimelineLogGroupBy = 'none' | 'day' | 'month' | 'year'

export type ITimelineLogRow<T extends ITimelineLogItem = ITimelineLogItem> = {
  item: T
  key: string | number
  idx: number
  timestamp: number
  date: Date
  type: ITimelineLogType
}

export type ITimelineLogGroup<T extends ITimelineLogItem = ITimelineLogItem> = {
  key: string
  label: string
  rows: ITimelineLogRow<T>[]
}

export type ITimelineLogTimePayload<T extends ITimelineLogItem = ITimelineLogItem> = {
  item: T
  date: Date
  now: number
  groupBy: ITimelineLogGroupBy | 'custom'
}

export type ITimelineLogProps<T extends ITimelineLogItem = ITimelineLogItem> = {
  /**
   * The entries of the log
   */
  items?: T[]

  /**
   * The item's field used as the `key`
   *
   * @default 'id'
   */
  itemKey?: keyof T & string

  /**
   * How the entries are grouped (under sticky headers)
   * - `none`: one flat list
   * - `day` | `month` | `year`: by calendar period, labeled "Today", "Yesterday", "March 2026", ...
   * - a function returning the group key of an item ~ the key is also the label unless `groupLabel` is provided
   *
   * @default 'day'
   */
  groupBy?: ITimelineLogGroupBy | ((payload: { item: T, date: Date }) => string)

  /**
   * Custom label of a group
   */
  groupLabel?: (payload: { key: string, date: Date, items: T[] }) => string

  /**
   * Whether the group headers stick to the top of the scroll container
   *
   * @default true
   */
  stickyHeaders?: boolean

  /**
   * Whether the groups can be collapsed by clicking on their header, see `v-model:collapsed`
   */
  collapsible?: boolean

  /**
   * Whether the group header shows the number of entries in the group
   */
  showCount?: boolean

  /**
   * Order of the entries (and the groups)
   * - `none`: keep the order of `items` (fastest, use when the data is already sorted)
   *
   * @default 'desc'
   */
  order?: 'desc' | 'asc' | 'none'

  /**
   * How the time of an entry is shown
   * - `auto`: relative for the last 24 hours ("5 min ago"), absolute otherwise
   *
   * @default 'auto'
   */
  timeFormat?: 'relative' | 'absolute' | 'auto'

  /**
   * Where the time is shown
   * - `gutter`: in a column left of the markers
   * - `inline`: next to the title
   * - `none`: hidden (still available in the slots)
   *
   * @default 'gutter'
   */
  timePlacement?: 'gutter' | 'inline' | 'none'

  /**
   * Intl options of the absolute time
   *
   * NOTE: By default, it omits what the group header already says (only the time when grouped by day)
   */
  absoluteFormat?: Intl.DateTimeFormatOptions

  /**
   * Fully custom time formatter, overrides `timeFormat` and `absoluteFormat`
   */
  timeFormatter?: (payload: ITimelineLogTimePayload<T>) => string

  /**
   * How an entry looks
   * - `compact`: one line (title, actor, time)
   * - `card`: a card with the description and the default slot as the body
   *
   * @default 'compact'
   */
  layout?: 'compact' | 'card'

  /**
   * Reduced spacing and smaller markers
   */
  dense?: boolean

  /**
   * How the marker on the rail looks
   *
   * @default 'icon'
   */
  marker?: 'icon' | 'dot' | 'none'

  /**
   * Whether the vertical line connecting the markers is shown
   *
   * @default true
   */
  connector?: boolean

  /**
   * Item kinds mapped to an icon, color and label, merged over the built-in ones
   * (`created`, `updated`, `deleted`, `comment`, `status`, `info`, `warning`, `error`)
   */
  types?: Record<string, ITimelineLogType>

  /**
   * Whether data is being fetched
   * - without items: skeleton rows are shown
   * - with items: a pending indicator is shown at the end
   */
  loading?: boolean

  /**
   * Number of skeleton rows shown while loading without items
   *
   * @default 5
   */
  skeletonCount?: number

  /**
   * Whether more entries can be loaded ~ shows the load more button and/or the infinite scroll trigger
   */
  hasMore?: boolean

  /**
   * How more entries are requested (the `load-more` event)
   * - `button`: a "Load more" button at the end
   * - `scroll`: automatically when the end scrolls into view
   *
   * @default 'button'
   */
  loadMore?: 'button' | 'scroll'

  /**
   * Label of the load more button
   *
   * @default 'Load more'
   */
  loadMoreLabel?: string

  /**
   * Text shown when there are no entries
   *
   * @default 'No activity yet'
   */
  emptyText?: string

  /**
   * Visual configuration
   *
   * NOTE: State selectors: `is-dense`, `is-card`, `is-compact`, `is-gutter` on the container,
   * `is-collapsed` on the group, `is-first` / `is-last` on the items
   */
  ui?: {
    containerClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType
    containerStyle?: () => CSSProperties

    groupClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['groupClass']>
    }) => ClassType
    groupStyle?: () => CSSProperties

    groupHeaderClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['groupHeaderClass']>
    }) => ClassType
    groupHeaderStyle?: () => CSSProperties

    listClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['listClass']>
    }) => ClassType
    listStyle?: () => CSSProperties

    itemClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['itemClass']>
    }) => ClassType
    itemStyle?: () => CSSProperties

    timeClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['timeClass']>
    }) => ClassType
    timeStyle?: () => CSSProperties

    markerClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['markerClass']>
    }) => ClassType
    markerStyle?: () => CSSProperties

    contentClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType
    contentStyle?: () => CSSProperties

    titleClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['titleClass']>
    }) => ClassType
    titleStyle?: () => CSSProperties

    descriptionClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['descriptionClass']>
    }) => ClassType
    descriptionStyle?: () => CSSProperties

    footerClass?: (payload: {
      defaults: ReturnType<typeof TIMELINE_LOG_DEFAULT_PROPS['ui']['footerClass']>
    }) => ClassType
    footerStyle?: () => CSSProperties
  }
}
