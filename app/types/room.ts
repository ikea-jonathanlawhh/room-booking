export interface TimeZoneInfo {
  dateTime: string
  timeZone: string
}

export interface WorkingHours {
  daysOfWeek: string[]
  startTime: string
  endTime: string
  timeZone?: {
    name: string
  }
}

export interface ScheduleItem {
  isPrivate?: boolean
  status: string
  subject?: string // PIC (Person In Charge) for room booking
  location?: string
  isMeeting?: boolean
  isRecurring?: boolean
  isException?: boolean
  isReminderSet?: boolean
  start: TimeZoneInfo
  end: TimeZoneInfo
}

export interface RoomSchedule {
  scheduleId: string
  availabilityView?: string
  scheduleItems: ScheduleItem[]
  workingHours?: WorkingHours
}

export interface ComputedRoomStatus {
  scheduleId: string
  displayName: string
  codeName: string
  isBusyNow: boolean
  isFreeRestOfDay: boolean
  currentBooking: ScheduleItem | null
  nextBooking: ScheduleItem | null
  todayBookings: ScheduleItem[]
  workingHoursText: string
  busyUntil?: string
  freeUntil?: string
  totalBookingsCount: number
}
