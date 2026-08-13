import type { RoomSchedule, ScheduleItem, ComputedRoomStatus } from '../types/room'

const DEFAULT_SUBJECT = 'Reserved / Private Meeting'

/**
 * Returns clean subject string with default fallback
 */
export function getCleanSubject(subject?: string): string {
  const trimmed = subject?.trim()
  return trimmed || DEFAULT_SUBJECT
}

/**
 * Parses MS Graph ISO date string with Singapore Standard Time (+08:00) default
 */
export function parseGraphDateTime(isoString?: string, timeZone?: string): Date {
  if (!isoString) return new Date(NaN)
  if (/Z|[+-]\d{2}:?\d{2}$/i.test(isoString)) {
    return new Date(isoString)
  }
  const cleanIso = isoString.replace(/(\.\d{3})\d+/, '$1')
  return new Date(`${cleanIso}+08:00`)
}

/**
 * Returns YYYY-MM-DD in Singapore timezone (prevents UTC timezone date shifts)
 */
export function getLocalDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(date)
}

/**
 * Fast extraction of YYYY-MM-DD from an ISO date string in Singapore timezone
 */
export function getItemLocalDateString(isoString?: string): string {
  if (!isoString) return ''
  if (isoString.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(isoString)) {
    return isoString.slice(0, 10)
  }
  try {
    const d = parseGraphDateTime(isoString)
    if (isNaN(d.getTime())) return isoString.split('T')[0] || ''
    return getLocalDateString(d)
  } catch {
    return isoString.split('T')[0] || ''
  }
}

/**
 * Extract all unique YYYY-MM-DD dates available across all room schedule items
 */
export function extractAvailableDates(rooms: RoomSchedule[]): string[] {
  const set = new Set<string>()
  for (const r of rooms) {
    for (const item of r.scheduleItems || []) {
      if (item.start?.dateTime) {
        const ds = getItemLocalDateString(item.start.dateTime)
        if (ds) set.add(ds)
      }
    }
  }
  return Array.from(set).sort()
}

/**
 * Parses email scheduleId into clean display title and code name
 * E.g. "MY.MeetingRoom.M113@OneIIG.onmicrosoft.com" -> "MY Meeting Room M113", "M113"
 */
export function parseRoomName(scheduleId: string): { displayName: string; codeName: string } {
  if (!scheduleId) return { displayName: 'Unknown Room', codeName: 'N/A' }

  const prefix = scheduleId.split('@')[0] || scheduleId
  const match = prefix.match(/(M\d+)/i)
  const codeName = match && match[1] ? match[1].toUpperCase() : prefix

  let clean = prefix
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._-]/g, ' ')
    .replace(/meeting\s*room/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  return { displayName: clean, codeName }
}

/**
 * Formats ISO date string to 24h time string in Singapore timezone (e.g., "10:30")
 */
export function formatTime(isoString?: string): string {
  if (!isoString) return '--:--'
  try {
    const date = parseGraphDateTime(isoString)
    if (isNaN(date.getTime())) return '--:--'
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Singapore'
    })
  } catch {
    return '--:--'
  }
}

/**
 * Formats ISO date string to full readable date in Singapore timezone (e.g., "Mon, Aug 10, 2026")
 */
export function formatDate(isoString?: string): string {
  if (!isoString) return ''
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(isoString)
      ? new Date(`${isoString}T00:00:00+08:00`)
      : parseGraphDateTime(isoString)
    if (isNaN(date.getTime())) return isoString
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Singapore'
    })
  } catch {
    return isoString
  }
}

/**
 * Formats date tab text (e.g., "Today (08-10)" or "Mon, Aug 10")
 */
export function formatDateTab(dStr: string, todayDateStr: string): string {
  if (dStr === todayDateStr) return `Today (${dStr.substring(5)})`
  try {
    const d = new Date(`${dStr}T00:00:00+08:00`)
    if (isNaN(d.getTime())) return dStr
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'Asia/Singapore'
    })
  } catch {
    return dStr
  }
}

interface ParsedScheduleItem {
  item: ScheduleItem
  startMs: number
  endMs: number
}

/**
 * Computes room status based on current target time and selected schedule date
 */
export function calculateRoomStatus(
  room: RoomSchedule,
  targetTime: Date = new Date(),
  selectedDateStr?: string
): ComputedRoomStatus {
  const displayName = room.name || room.scheduleId
  const codeName = room.name || room.scheduleId
  const items = room.scheduleItems || []
  const targetMs = targetTime.getTime()

  const viewDateStr = selectedDateStr || getLocalDateString(targetTime)
  const isTodayView = viewDateStr === getLocalDateString(targetTime)

  // Single-pass parsing, filtering, and subject cleanup
  const parsedBookings: ParsedScheduleItem[] = []
  for (const item of items) {
    if (!item.start?.dateTime || !item.end?.dateTime) continue

    const itemDateStr = getItemLocalDateString(item.start.dateTime)
    if (itemDateStr !== viewDateStr) continue

    const startMs = parseGraphDateTime(item.start.dateTime, item.start.timeZone).getTime()
    const endMs = parseGraphDateTime(item.end.dateTime, item.end.timeZone).getTime()
    const cleanSubject = getCleanSubject(item.subject)

    parsedBookings.push({
      item: { ...item, subject: cleanSubject },
      startMs,
      endMs
    })
  }

  // Sort by startMs
  parsedBookings.sort((a, b) => a.startMs - b.startMs)

  let currentBooking: ScheduleItem | null = null
  let nextBooking: ScheduleItem | null = null
  let isBusyNow = false
  let hasFutureBookings = false

  for (const pb of parsedBookings) {
    if (isTodayView && targetMs >= pb.startMs && targetMs < pb.endMs) {
      isBusyNow = true
      currentBooking = pb.item
    } else if (targetMs < pb.startMs) {
      hasFutureBookings = true
      if (!nextBooking) {
        nextBooking = pb.item
      }
    }
  }

  const isFreeRestOfDay = !isBusyNow && (isTodayView ? !hasFutureBookings : parsedBookings.length === 0)

  const workingHoursStartStr = room.workingHours?.startTime?.substring(0, 5) || '08:00'
  const workingHoursEndStr = room.workingHours?.endTime?.substring(0, 5) || '17:00'

  const busyUntil = currentBooking ? formatTime(currentBooking.end.dateTime) : ''
  const freeUntil = nextBooking ? formatTime(nextBooking.start.dateTime) : (!isBusyNow ? workingHoursEndStr : '')

  const todayBookings = parsedBookings.map(pb => pb.item)

  return {
    scheduleId: room.scheduleId,
    displayName,
    codeName,
    isBusyNow,
    isFreeRestOfDay,
    currentBooking,
    nextBooking,
    todayBookings,
    workingHoursText: `${workingHoursStartStr} - ${workingHoursEndStr}`,
    busyUntil,
    freeUntil,
    totalBookingsCount: todayBookings.length
  }
}
