<template>
  <div @click="$emit('select', room)"
    class="japandi-card relative rounded-2xl p-5 cursor-pointer flex flex-col justify-between group overflow-hidden">
    <div>
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 class="text-lg font-bold text-[#2A2825] group-hover:text-[#D9B500] transition-colors line-clamp-1">
            {{ status.displayName }}
          </h3>
          <p v-if="room.description" class="text-xs text-[#736D66] truncate max-w-[220px]">
            {{ room.description }}
          </p>
        </div>

        <div class="flex flex-col items-end">
          <RoomStatusBadge :status="status" size="md" />
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-[#E2DACF]">
        <!-- BUSY STATE DETAILS -->
        <div v-if="status.isBusyNow && status.currentBooking" class="space-y-2">
          <div class="flex items-center justify-between text-xs text-[#8C4E43] font-medium">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Occupied until {{ status.busyUntil }}
            </span>
            <span class="text-[11px] bg-[#F5E6E3] px-2 py-0.5 rounded border border-[#E5C7C2]">
              In Progress
            </span>
          </div>

          <div class="bg-[#EFEBE4] p-3 rounded-xl border border-[#E2DACF]">
            <p class="text-xs text-[#736D66] font-medium uppercase tracking-wider mb-0.5">Next Meeting Time</p>
            <p class="text-sm font-semibold text-[#2A2825]">
              <template v-if="status.nextBooking">
                {{ formatTime(status.nextBooking.start.dateTime) }} - {{ formatTime(status.nextBooking.end.dateTime) }}
              </template>
              <template v-else>
                No further meetings today
              </template>
            </p>
          </div>
        </div>

        <!-- AVAILABLE STATE DETAILS -->
        <div v-else class="space-y-2">
          <div v-if="status.nextBooking" class="space-y-2">
            <div class="bg-[#EFEBE4] p-3 rounded-xl border border-[#E2DACF]">
              <p class="text-xs text-[#736D66] font-medium uppercase tracking-wider mb-0.5">Next Meeting Time</p>
              <p class="text-sm font-semibold text-[#2A2825]">
                {{ formatTime(status.nextBooking.start.dateTime) }} - {{ formatTime(status.nextBooking.end.dateTime) }}
              </p>
            </div>
          </div>

          <div v-else class="badge-available p-3 rounded-xl text-center">
            <p class="text-xs font-semibold flex items-center justify-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No further bookings today
            </p>
            <p class="text-[11px] opacity-80 mt-0.5">
              Available for spontaneous meetings
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-[#E2DACF] flex items-center justify-end text-xs text-[#736D66]">
      <span class="font-semibold text-[#2A2825] flex items-center gap-1 group-hover:text-[#D9B500] transition-colors">
        View Schedule &rarr;
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomSchedule, ComputedRoomStatus } from '../types/room'
import { formatTime } from '../utils/room-helpers'

const props = defineProps<{
  room: RoomSchedule
  status: ComputedRoomStatus
}>()

defineEmits<{
  (e: 'select', room: RoomSchedule): void
}>()
</script>
