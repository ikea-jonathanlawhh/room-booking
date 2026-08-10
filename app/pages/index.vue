<template>
  <div class="min-h-screen flex flex-col bg-[#F5F2EB] text-[#2A2825] selection:bg-[#FBDA0C] selection:text-[#2A2825]">
    
    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 bg-[#EFEBE4] border-b border-[#E2DACF] px-4 lg:px-8 py-4">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <!-- Brand Title -->
        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div class="flex items-center gap-3">
            <div class="p-1.5 rounded-2xl bg-[#FFF8D6] border border-[#FBDA0C] flex items-center justify-center shrink-0">
              <img src="/favicon.svg" alt="App Icon" class="w-7 h-7 rounded-xl object-cover" />
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-[#2A2825] tracking-tight flex items-center gap-2">
                {{ headerTitle }}
              </h1>
            </div>
          </div>

          <!-- Refresh Button (Mobile) -->
          <button 
            @click="refreshData"
            :disabled="pending"
            class="md:hidden p-2 rounded-xl bg-[#FAF8F5] text-[#2A2825] border border-[#E2DACF] hover:bg-[#EFEBE4]"
          >
            <svg class="w-5 h-5" :class="{'animate-spin': pending}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Clock & Date Selector Bar -->
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          <!-- Schedule Date Switcher Tabs & Live Clock -->
          <div v-if="availableDates.length > 0" class="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E2DACF] text-xs">
            <button 
              v-for="dStr in availableDates" 
              :key="dStr"
              @click="selectedDateStr = dStr"
              class="px-3.5 py-1.5 rounded-lg transition-all font-semibold"
              :class="selectedDateStr === dStr ? 'bg-[#FBDA0C] text-[#2A2825] shadow-sm font-bold' : 'text-[#736D66] hover:text-[#2A2825] hover:bg-[#EFEBE4]'"
            >
              📅 {{ formatDateTab(dStr, todayDateStr) }}
            </button>
          </div>

          <!-- Live Clock -->
          <div class="bg-[#FAF8F5] px-4 py-2 rounded-xl border border-[#E2DACF] flex items-center gap-2 font-mono text-xs font-bold text-[#2A2825]">
            <span class="w-2 h-2 rounded-full bg-[#FBDA0C]"></span>
            <span>{{ liveTimeString }}</span>
          </div>

          <!-- Refresh Button (Desktop) -->
          <button 
            @click="refreshData"
            :disabled="pending"
            class="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEBE4] text-[#2A2825] text-xs font-semibold border border-[#E2DACF] transition-colors"
          >
            <svg class="w-4 h-4" :class="{'animate-spin': pending}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
      
      <!-- Date Banner Context -->
      <div v-if="selectedDateStr && selectedDateStr !== todayDateStr" class="bg-[#EBE4D8] border border-[#D6C9B5] p-4 rounded-2xl flex items-center justify-between gap-4 text-xs text-[#6B5C43]">
        <div class="flex items-center gap-2.5">
          <svg class="w-5 h-5 text-[#6B5C43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Viewing Schedule for <strong class="text-[#2A2825]">{{ formatDate(selectedDateStr) }}</strong>. Today is {{ formatDate(todayDateStr) }}.
          </span>
        </div>
        <button 
          v-if="availableDates.includes(todayDateStr)"
          @click="selectedDateStr = todayDateStr" 
          class="px-3 py-1 bg-[#FBDA0C] text-[#2A2825] hover:bg-[#E5C700] rounded-lg font-bold transition-colors"
        >
          Jump to Today
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-[#EFEBE4] p-4 rounded-2xl border border-[#E2DACF] flex flex-col md:flex-row items-center justify-between gap-4">
        
        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button 
            v-for="filter in filters" 
            :key="filter.id"
            @click="activeFilter = filter.id"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border"
            :class="activeFilter === filter.id ? 'bg-[#FBDA0C] border-[#FBDA0C] text-[#2A2825] shadow-sm' : 'bg-[#FAF8F5] border-[#E2DACF] text-[#736D66] hover:text-[#2A2825] hover:border-[#C8BDB0]'"
          >
            {{ filter.label }}
            <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" :class="activeFilter === filter.id ? 'bg-black/15 text-[#2A2825]' : 'bg-[#EFEBE4] text-[#736D66]'">
              {{ filter.count }}
            </span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-72">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search room name or code..."
            class="w-full bg-[#FAF8F5] border border-[#E2DACF] rounded-xl px-4 py-2 pl-9 text-xs text-[#2A2825] placeholder-[#9C958C] focus:outline-none focus:border-[#FBDA0C] transition-colors"
          />
          <svg class="w-4 h-4 text-[#9C958C] absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending && !data" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#FBDA0C] border-t-transparent"></div>
        <p class="text-[#736D66] text-xs mt-3 font-semibold">Loading live room schedules...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-[#F5E6E3] border border-[#E5C7C2] p-6 rounded-2xl text-center">
        <p class="text-[#8C4E43] font-bold text-sm">Failed to load meeting room data from API</p>
        <p class="text-xs text-[#8C4E43]/80 mt-1">{{ error.statusMessage || error.message }}</p>
        <button @click="refreshData" class="mt-4 px-4 py-2 bg-[#8C4E43] hover:bg-[#723E34] text-white rounded-xl text-xs font-bold transition-colors">
          Retry API Fetch
        </button>
      </div>

      <!-- Room Cards Grid -->
      <div v-else-if="filteredRooms.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RoomCard 
          v-for="item in filteredRooms" 
          :key="item.room.scheduleId" 
          :room="item.room" 
          :status="item.status"
          @select="openRoomDetail"
        />
      </div>

      <!-- Empty Filter Results -->
      <div v-else class="text-center py-16 bg-[#FAF8F5] rounded-3xl border border-[#E2DACF]">
        <p class="text-[#2A2825] font-bold text-sm">No meeting rooms found matching your filter</p>
        <p class="text-xs text-[#736D66] mt-1">Try clearing search or switching filter tab.</p>
        <button @click="activeFilter = 'all'; searchQuery = ''" class="mt-4 px-4 py-2 bg-[#EFEBE4] hover:bg-[#E2DACF] text-[#2A2825] rounded-xl text-xs font-bold transition-colors">
          Reset Filters
        </button>
      </div>
    </main>

    <!-- Detail Booking Modal -->
    <RoomDetailModal 
      :is-open="isModalOpen" 
      :room="selectedRoom" 
      :status="selectedStatus"
      :target-time="currentTime"
      :selected-date-str="selectedDateStr"
      @close="isModalOpen = false"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { RoomSchedule, ComputedRoomStatus } from '../types/room'
import { calculateRoomStatus, extractAvailableDates, getLocalDateString, formatDate, formatDateTab } from '../utils/room-helpers'

const config = useRuntimeConfig()
const headerTitle = computed(() => config.public.headerTitle || 'Meeting Room Display')

useHead({
  title: headerTitle
})

// Fetch live data exclusively from Nitro API route (/api/rooms)
const { data, pending, error, refresh: refreshData } = await useFetch<{ value: RoomSchedule[] }>('/api/rooms')

// State
const searchQuery = ref('')
const activeFilter = ref<'all' | 'available' | 'busy' | 'free_rest_day'>('all')
const isModalOpen = ref(false)
const selectedRoom = ref<RoomSchedule | null>(null)
const selectedStatus = ref<ComputedRoomStatus | null>(null)
const selectedDateStr = ref<string>('')

// Use useState so SSR timestamp is hydrated cleanly to client without hydration mismatch
const currentTimestamp = useState<number>('currentTimestamp', () => Date.now())
const currentTime = computed(() => new Date(currentTimestamp.value))
const todayDateStr = computed(() => getLocalDateString(currentTime.value))

let clockTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  clockTimer = setInterval(() => {
    currentTimestamp.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

// Available dates in schedule items
const availableDates = computed(() => {
  const list = data.value?.value || []
  return extractAvailableDates(list)
})

// Auto-select date on initial data load
watch(availableDates, (dates) => {
  if (dates.length > 0 && !selectedDateStr.value) {
    if (dates.includes(todayDateStr.value)) {
      selectedDateStr.value = todayDateStr.value
    } else {
      selectedDateStr.value = dates[0]
    }
  }
}, { immediate: true })

const liveTimeString = computed(() => {
  const d = currentTime.value
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`
})

// Single-pass computation of room status and filter metrics
const roomAnalysis = computed(() => {
  const list = data.value?.value || []
  const activeDate = selectedDateStr.value || todayDateStr.value
  const now = currentTime.value

  let availableCount = 0
  let busyCount = 0
  let freeRestOfDayCount = 0

  const rooms = list.map(room => {
    const status = calculateRoomStatus(room, now, activeDate)
    if (status.isBusyNow) {
      busyCount++
    } else {
      availableCount++
    }
    if (status.isFreeRestOfDay) {
      freeRestOfDayCount++
    }
    return { room, status }
  }).sort((a, b) => a.status.displayName.localeCompare(b.status.displayName, undefined, { numeric: true, sensitivity: 'base' }))

  return {
    rooms,
    availableCount,
    busyCount,
    freeRestOfDayCount
  }
})

const computedRooms = computed(() => roomAnalysis.value.rooms)

const filters = computed(() => [
  { id: 'all', label: 'All Rooms', count: roomAnalysis.value.rooms.length },
  { id: 'available', label: 'Available Now', count: roomAnalysis.value.availableCount },
  { id: 'busy', label: 'Busy Now', count: roomAnalysis.value.busyCount },
  { id: 'free_rest_day', label: 'Free Rest of Day', count: roomAnalysis.value.freeRestOfDayCount }
])

// Filtered rooms
const filteredRooms = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const filter = activeFilter.value

  return computedRooms.value.filter(({ room, status }) => {
    const matchesSearch = !q || 
      status.displayName.toLowerCase().includes(q) ||
      status.codeName.toLowerCase().includes(q) ||
      room.scheduleId.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (filter === 'available') return !status.isBusyNow
    if (filter === 'busy') return status.isBusyNow
    if (filter === 'free_rest_day') return status.isFreeRestOfDay

    return true
  })
})

function openRoomDetail(room: RoomSchedule) {
  selectedRoom.value = room
  const activeDate = selectedDateStr.value || todayDateStr.value
  selectedStatus.value = calculateRoomStatus(room, currentTime.value, activeDate)
  isModalOpen.value = true
}
</script>
