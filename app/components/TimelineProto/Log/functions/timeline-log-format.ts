// Types
import type { ITimelineLogGroupBy } from '../types/timeline-log-props.type'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Creating `Intl` formatters is expensive, formatting with an existing one is cheap ~ one per locale & options
const relativeFormats = new Map<string, Intl.RelativeTimeFormat>()

function getRelativeFormat(locale: string | undefined, style: Intl.RelativeTimeFormatStyle = 'short') {
  const key = `${locale ?? ''}|${style}`
  let format = relativeFormats.get(key)

  if (!format) {
    format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style })
    relativeFormats.set(key, format)
  }

  return format
}

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}

/**
 * Parses the item's date into a native `Date`, avoiding `dayjs` for the common cheap cases
 */
export function toNativeDate(value: Datetime): Date {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'number') {
    return new Date(value)
  }

  return $date(value).toDate()
}

/**
 * "just now", "5 min. ago", "3 hr. ago", "yesterday", "2 wk. ago", ...
 */
export function formatRelativeTime(date: Date, now: number, locale?: string) {
  const diff = date.getTime() - now
  const abs = Math.abs(diff)
  const rtf = getRelativeFormat(locale)

  if (abs < 45_000) {
    return rtf.format(0, 'second')
  }

  if (abs < HOUR) {
    return rtf.format(Math.round(diff / MINUTE), 'minute')
  }

  if (abs < DAY) {
    return rtf.format(Math.round(diff / HOUR), 'hour')
  }

  // Calendar days, so that "yesterday" means the previous date and not "24-48 hours ago"
  const dayDiff = Math.round((startOfDay(date) - startOfDay(new Date(now))) / DAY)

  if (Math.abs(dayDiff) < 7) {
    return rtf.format(dayDiff, 'day')
  }

  if (Math.abs(dayDiff) < 30) {
    return rtf.format(Math.round(dayDiff / 7), 'week')
  }

  if (Math.abs(dayDiff) < 365) {
    return rtf.format(Math.round(dayDiff / 30), 'month')
  }

  return rtf.format(Math.round(dayDiff / 365), 'year')
}

export function isWithinDay(date: Date, now: number) {
  return Math.abs(now - date.getTime()) < DAY
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * The absolute format omits what the group header already says
 */
export function getDefaultAbsoluteFormat(groupBy: ITimelineLogGroupBy | 'custom'): Intl.DateTimeFormatOptions {
  switch (groupBy) {
    case 'day':
      return { hour: 'numeric', minute: '2-digit' }
    case 'month':
    case 'year':
      return { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }
    default:
      return { dateStyle: 'short', timeStyle: 'short' }
  }
}

export const TIMELINE_LOG_FULL_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'full', timeStyle: 'medium' }

export function getGroupKey(date: Date, groupBy: ITimelineLogGroupBy) {
  switch (groupBy) {
    case 'day':
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    case 'month':
      return `${date.getFullYear()}-${date.getMonth()}`
    case 'year':
      return `${date.getFullYear()}`
    default:
      return ''
  }
}

/**
 * "Today", "Yesterday", "Monday, March 9", "March 2026", "2026"
 */
export function getGroupLabel(date: Date, groupBy: ITimelineLogGroupBy, now: number, locale?: string) {
  const isThisYear = date.getFullYear() === new Date(now).getFullYear()

  switch (groupBy) {
    case 'day': {
      const dayDiff = Math.round((startOfDay(date) - startOfDay(new Date(now))) / DAY)

      if (dayDiff === 0 || dayDiff === -1) {
        return capitalize(getRelativeFormat(locale, 'long').format(dayDiff, 'day'))
      }

      return getDateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: isThisYear ? undefined : 'numeric',
      }).format(date)
    }

    case 'month':
      return capitalize(getDateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date))

    case 'year':
      return String(date.getFullYear())

    default:
      return ''
  }
}
