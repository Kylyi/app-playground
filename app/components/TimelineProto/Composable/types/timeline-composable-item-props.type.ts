// Types
import type {
  ITimelineComposableLineStyle,
  ITimelineComposableMarker,
  ITimelineComposableStatus,
  ITimelineComposableValue,
} from './timeline-composable-props.type'

// Constants
import type { ITimelineComposableColor } from '../constants/timeline-composable-default-props.constant'

export type ITimelineComposableItemProps = {
  /**
   * Identifies the item for the timeline's `modelValue` (progress) and `select`
   */
  value?: ITimelineComposableValue

  /**
   * Title of the item (or use the `title` slot)
   */
  title?: string

  /**
   * Secondary text shown below the title
   */
  description?: string

  /**
   * Time / date of the item, already formatted ~ placed according to the timeline's `timePlacement`
   */
  time?: string

  /**
   * Icon shown in the marker
   *
   * NOTE: An Iconify name (`lucide:user`) or a UnoCSS icon class (`i-lucide:user`), like `Btn`'s `icon`
   */
  icon?: string

  /**
   * Color of the marker and the line leading from it, a theme color name or any CSS color
   *
   * NOTE: Defaults to the timeline's `color`
   */
  color?: ITimelineComposableColor | (string & {})

  /**
   * Forces the status of the item, otherwise derived from the timeline's `modelValue`
   */
  status?: Exclude<ITimelineComposableStatus, 'default'>

  /**
   * Overrides the timeline's `marker`
   */
  marker?: ITimelineComposableMarker

  /**
   * Forces the side of the content
   *
   * NOTE: Meant for the `alternate` timeline (e.g. a chat-like history), other sides size their columns
   * for a single side
   */
  side?: 'start' | 'end'

  /**
   * Style of the line leading from this item to the next one, overrides the timeline's `lineStyle`
   */
  lineStyle?: ITimelineComposableLineStyle

  /**
   * Whether the content (default slot) can be collapsed, overrides the timeline's `collapsible`
   */
  collapsible?: boolean

  /**
   * Whether the item cannot be selected
   */
  disabled?: boolean

  /**
   * Renders the item as a loading placeholder
   */
  skeleton?: boolean
}
