<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#2A2825]/60 backdrop-blur-xs transition-all duration-300"
      @click.self="close"
    >
      <div 
        class="bg-[#FAF8F5] w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-[#E2DACF] shadow-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- Modal Header -->
        <div class="p-6 bg-[#EFEBE4] border-b border-[#E2DACF] flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-[#E2DACF] text-[#2A2825] uppercase tracking-wide">
                {{ status?.codeName || 'ROOM' }}
              </span>
              <RoomStatusBadge :status="status" size="sm" />
            </div>
            <h2 class="text-2xl font-black text-[#2A2825] tracking-tight">
              {{ status?.displayName || 'Meeting Room Details' }}
            </h2>
            <p class="text-xs text-[#736D66] font-mono mt-0.5">
              {{ room?.scheduleId }}
            </p>
          </div>

          <button 
            @click="close"
            class="p-2 text-[#736D66] hover:text-[#2A2825] bg-[#E2DACF]/60 hover:bg-[#E2DACF] rounded-full transition-colors"
            title="Close"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="p-6 overflow-y-auto space-y-6">
          
          <!-- Date Summary Bar -->
          <div class="bg-[#EFEBE4] p-4 rounded-2xl border border-[#E2DACF] flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-[#FFF5C2] text-[#6B5900] rounded-xl border border-[#E6C200]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-[#736D66] font-medium">Selected Date</p>
                <p class="text-sm font-bold text-[#2A2825]">
                  {{ formatDate(activeDateStr) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-[#F5E6E3] text-[#8C4E43] rounded-xl border border-[#E5C7C2]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-[#736D66] font-medium">Total Bookings Today</p>
                <p class="text-sm font-bold text-[#2A2825]">
                  {{ dayItems.length }} Meeting(s)
                </p>
              </div>
            </div>
          </div>

          <!-- Daily Hourly Visual Timeline Bar -->
          <div class="bg-[#EFEBE4] p-5 rounded-2xl border border-[#E2DACF]">
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#736D66] mb-3">
              <span>Day Timeline</span>
            </h4>
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
              <div 
                v-for="(slot, idx) in timelineSlots" 
                :key="idx" 
                class="flex flex-col items-center min-w-0 transition-all"
                :style="{ flex: `${slot.span} ${slot.span} 0%` }"
              >
                <div 
                  class="w-full h-8 rounded-lg transition-all border flex items-center justify-center text-[10px] font-bold"
                  :class="slot.isOccupied ? 'timeline-busy' : 'timeline-free'"
                >
                 {{ slot.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule Items Detailed List -->
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <h3 class="text-sm font-bold text-[#2A2825] uppercase tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4 text-[#FBDA0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Detailed Booking List
              </h3>
              <button 
                v-if="pastItemsCount > 0"
                @click="showPastMeetings = !showPastMeetings"
                class="text-xs px-3 py-1 rounded-lg border font-semibold transition-all"
                :class="showPastMeetings ? 'bg-[#FBDA0C] text-[#2A2825] border-[#FBDA0C]' : 'bg-[#FAF8F5] text-[#736D66] border-[#E2DACF] hover:bg-[#EFEBE4] hover:text-[#2A2825]'"
              >
                {{ showPastMeetings ? 'Hide Past Meetings' : `Show Past Meetings (${pastItemsCount})` }}
              </button>
            </div>

            <div v-if="visibleDayItems.length === 0" class="text-center py-10 bg-[#EFEBE4] rounded-2xl border border-[#E2DACF]">
              <p class="text-[#6B5900] font-semibold text-sm">🎉 No Upcoming Bookings</p>
              <p class="text-xs text-[#736D66] mt-1">
                {{ pastItemsCount > 0 ? 'All meetings for this date have finished.' : 'No bookings scheduled for this date.' }}
              </p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="(item, idx) in visibleDayItems" 
                :key="idx"
                class="bg-[#EFEBE4] p-4 rounded-2xl border transition-all duration-200"
                :class="[
                  isItemActiveNow(item) ? 'border-[#8C4E43] shadow-md ring-1 ring-[#8C4E43]/40' : 'border-[#E2DACF] hover:border-[#C8BDB0]',
                  isItemPast(item) ? 'opacity-65' : ''
                ]"
              >
                <div class="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <!-- Time Slot -->
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-lg bg-[#FAF8F5] font-mono text-xs font-bold text-[#2A2825] border border-[#E2DACF]">
                      {{ formatTime(item.start.dateTime) }} - {{ formatTime(item.end.dateTime) }}
                    </span>
                    <span 
                      v-if="isItemActiveNow(item)"
                      class="px-2 py-0.5 rounded text-[11px] font-extrabold badge-busy animate-pulse"
                    >
                      LIVE NOW
                    </span>
                    <span 
                      v-else-if="isItemPast(item)"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2DACF] text-[#736D66]"
                    >
                      PAST
                    </span>
                  </div>

                  <!-- Badges -->
                  <div class="flex items-center gap-1.5">
                    <span v-if="item.isRecurring" class="px-2 py-0.5 rounded text-[10px] bg-[#EBE4D8] text-[#6B5C43] border border-[#D6C9B5]">
                      Recurring
                    </span>
                    <span v-if="item.isMeeting" class="px-2 py-0.5 rounded text-[10px] bg-[#FFF5C2] text-[#6B5900] border border-[#E6C200]">
                      Meeting
                    </span>
                  </div>
                </div>

                <!-- PIC Subject -->
                <div class="mt-2">
                  <p class="text-base font-bold text-[#2A2825] mt-0.5">
                    {{ item.subject }}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-4 bg-[#EFEBE4] border-t border-[#E2DACF] flex items-center justify-between text-xs text-[#736D66]">
          <span>Click outside or press Esc to close</span>
          <button 
            @click="close"
            class="px-5 py-2 rounded-xl bg-[#FBDA0C] text-[#2A2825] font-bold hover:bg-[#E5C700] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RoomSchedule, ComputedRoomStatus, ScheduleItem } from '../types/room'
import { formatTime, formatDate, getLocalDateString, getItemLocalDateString, getCleanSubject } from '../utils/room-helpers'

const props = defineProps<{
  isOpen: boolean
  room: RoomSchedule | null
  status: ComputedRoomStatus | null
  targetTime?: Date
  selectedDateStr?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const showPastMeetings = ref(false)

const close = () => {
  emit('close')
}

const activeDateStr = computed(() => {
  if (props.selectedDateStr) return props.selectedDateStr
  if (props.targetTime) return getLocalDateString(props.targetTime)
  return getLocalDateString(new Date())
})

interface ParsedModalItem extends ScheduleItem {
  startMs: number
  endMs: number
}

const dayItems = computed<ParsedModalItem[]>(() => {
  if (!props.room?.scheduleItems) return []
  const targetDateStr = activeDateStr.value
  const result: ParsedModalItem[] = []
  
  for (const item of props.room.scheduleItems) {
    if (!item.start?.dateTime || !item.end?.dateTime) continue
    if (getItemLocalDateString(item.start.dateTime) !== targetDateStr) continue

    const startMs = new Date(item.start.dateTime).getTime()
    const endMs = new Date(item.end.dateTime).getTime()

    result.push({
      ...item,
      subject: getCleanSubject(item.subject),
      startMs,
      endMs
    })
  }

  return result.sort((a, b) => a.startMs - b.startMs)
})

function isItemPast(item: ParsedModalItem): boolean {
  const nowMs = (props.targetTime || new Date()).getTime()
  return item.endMs <= nowMs
}

const pastItemsCount = computed(() => dayItems.value.filter(item => isItemPast(item)).length)

const visibleDayItems = computed(() => {
  if (showPastMeetings.value) return dayItems.value
  return dayItems.value.filter(item => !isItemPast(item))
})

function isItemActiveNow(item: ParsedModalItem): boolean {
  const nowMs = (props.targetTime || new Date()).getTime()
  return nowMs >= item.startMs && nowMs < item.endMs
}

interface TimelineSlot {
  label: string
  isOccupied: boolean
  span: number
}

const timelineSlots = computed<TimelineSlot[]>(() => {
  const slots: TimelineSlot[] = []
  const items = dayItems.value
  const activeDate = activeDateStr.value

  if (!activeDate) return slots

  const parts = activeDate.split('-').map(Number)
  const year = parts[0] ?? 2026
  const month = parts[1] ?? 1
  const day = parts[2] ?? 1

  // 1. Build 20 half-hour segments (08:00 to 18:00)
  interface Segment {
    label: string
    minute: number
    meetingIndex: number
  }

  const segments: Segment[] = []
  for (let i = 0; i < 20; i++) {
    const hour = 8 + Math.floor(i / 2)
    const minute = (i % 2) * 30
    const dStart = new Date(year, month - 1, day, hour, minute, 0)
    const dEnd = new Date(year, month - 1, day, minute === 30 ? hour + 1 : hour, minute === 30 ? 0 : 30, 0)
    const startMs = dStart.getTime()
    const endMs = dEnd.getTime()

    // Find which meeting index overlaps this segment
    let meetingIdx = -1
    for (let mIdx = 0; mIdx < items.length; mIdx++) {
      const item = items[mIdx]
      if (item && item.startMs < endMs && item.endMs > startMs) {
        meetingIdx = mIdx
        break
      }
    }

    const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    segments.push({ label, minute, meetingIndex: meetingIdx })
  }

  // 2. Group segments into timeline blocks with proportional duration spans
  let idx = 0
  while (idx < segments.length) {
    const current = segments[idx]
    if (!current) {
      idx++
      continue
    }

    if (current.meetingIndex !== -1) {
      const meetingIdx = current.meetingIndex
      const startLabel = current.label
      let spanCount = 0

      while (idx < segments.length && segments[idx]?.meetingIndex === meetingIdx) {
        spanCount++
        idx++
      }

      slots.push({
        label: startLabel,
        isOccupied: true,
        span: spanCount
      })
    } else {
      const nextSeg = segments[idx + 1]
      if (current.minute === 0 && nextSeg && nextSeg.meetingIndex === -1) {
        slots.push({
          label: current.label,
          isOccupied: false,
          span: 2
        })
        idx += 2
      } else {
        slots.push({
          label: current.label,
          isOccupied: false,
          span: 1
        })
        idx += 1
      }
    }
  }

  return slots
})
</script>
