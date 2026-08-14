<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { loggedIn, user } = useUserSession()

interface Building {
  id: string
  name: string
  description?: string
  roomCount?: number
  createdTimestamp: string
  createdBy: string
  updateTimestamp: string
  updatedBy: string
}

interface Room {
  id: string
  buildingId: string
  buildingName?: string
  name: string
  email: string
  description?: string
  createdTimestamp: string
  createdBy: string
  updateTimestamp: string
  updatedBy: string
}

// Reactive state
const buildings = ref<Building[]>([])
const rooms = ref<Room[]>([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

// Filters
const selectedBuildingFilter = ref<string>('all')
const searchQuery = ref<string>('')

// Building Modal State
const isBuildingModalOpen = ref(false)
const editingBuilding = ref<Building | null>(null)
const buildingForm = ref({
  name: '',
  description: ''
})
const buildingFormError = ref('')
const buildingSubmitting = ref(false)

// Room Modal State
const isRoomModalOpen = ref(false)
const editingRoom = ref<Room | null>(null)
const roomForm = ref({
  buildingId: '',
  name: '',
  email: '',
  description: ''
})
const roomFormError = ref('')
const roomSubmitting = ref(false)

// Delete Confirm Modal
const isDeleteModalOpen = ref(false)
const deleteTarget = ref<{ type: 'building' | 'room', id: string, name: string } | null>(null)
const deleteSubmitting = ref(false)

// Fetch Data
const fetchData = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [bldRes, rmRes] = await Promise.all([
      $fetch<{ value: Building[] }>('/api/admin/buildings'),
      $fetch<{ value: Room[] }>('/api/admin/rooms')
    ])
    buildings.value = bldRes.value || []
    rooms.value = rmRes.value || []
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || 'Failed to load buildings and rooms'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Filtered rooms
const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    const matchesBuilding = selectedBuildingFilter.value === 'all' || room.buildingId === selectedBuildingFilter.value
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query ||
      room.name.toLowerCase().includes(query) ||
      room.email.toLowerCase().includes(query) ||
      (room.description && room.description.toLowerCase().includes(query)) ||
      (room.buildingName && room.buildingName.toLowerCase().includes(query))

    return matchesBuilding && matchesSearch
  })
})

// Open Create Building Modal
const openCreateBuildingModal = () => {
  editingBuilding.value = null
  buildingForm.value = { name: '', description: '' }
  buildingFormError.value = ''
  isBuildingModalOpen.value = true
}

// Open Edit Building Modal
const openEditBuildingModal = (bld: Building) => {
  editingBuilding.value = bld
  buildingForm.value = {
    name: bld.name,
    description: bld.description || ''
  }
  buildingFormError.value = ''
  isBuildingModalOpen.value = true
}

// Submit Building Form
const handleSaveBuilding = async () => {
  buildingFormError.value = ''
  if (!buildingForm.value.name.trim()) {
    buildingFormError.value = 'Building name is required.'
    return
  }

  buildingSubmitting.value = true
  try {
    const payload = {
      name: buildingForm.value.name.trim().toUpperCase(),
      description: buildingForm.value.description?.trim() || ''
    }
    if (editingBuilding.value) {
      // Update
      await $fetch(`/api/admin/buildings/${editingBuilding.value.id}`, {
        method: 'PUT',
        body: payload
      })
      successMessage.value = `Building "${payload.name}" updated successfully.`
    } else {
      // Create
      await $fetch('/api/admin/buildings', {
        method: 'POST',
        body: payload
      })
      successMessage.value = `Building "${payload.name}" created successfully.`
    }
    isBuildingModalOpen.value = false
    await fetchData()
    setTimeout(() => { successMessage.value = '' }, 4000)
  } catch (err: any) {
    buildingFormError.value = err.data?.statusMessage || err.message || 'Failed to save building'
  } finally {
    buildingSubmitting.value = false
  }
}

// Open Create Room Modal
const openCreateRoomModal = (defaultBuildingId?: string) => {
  editingRoom.value = null
  roomForm.value = {
    buildingId: defaultBuildingId || (buildings.value[0]?.id || ''),
    name: '',
    email: '',
    description: ''
  }
  roomFormError.value = ''
  isRoomModalOpen.value = true
}

// Open Edit Room Modal
const openEditRoomModal = (rm: Room) => {
  editingRoom.value = rm
  roomForm.value = {
    buildingId: rm.buildingId,
    name: rm.name,
    email: rm.email,
    description: rm.description || ''
  }
  roomFormError.value = ''
  isRoomModalOpen.value = true
}

// Submit Room Form
const handleSaveRoom = async () => {
  roomFormError.value = ''
  if (!roomForm.value.buildingId) {
    roomFormError.value = 'Please select a building.'
    return
  }
  if (!roomForm.value.name.trim()) {
    roomFormError.value = 'Room name is required.'
    return
  }
  if (!roomForm.value.email.trim()) {
    roomFormError.value = 'Room email is required.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(roomForm.value.email.trim())) {
    roomFormError.value = 'Please enter a valid email address.'
    return
  }

  roomSubmitting.value = true
  try {
    if (editingRoom.value) {
      // Update
      await $fetch(`/api/admin/rooms/${editingRoom.value.id}`, {
        method: 'PUT',
        body: roomForm.value
      })
      successMessage.value = `Room "${roomForm.value.name}" updated successfully.`
    } else {
      // Create
      await $fetch('/api/admin/rooms', {
        method: 'POST',
        body: roomForm.value
      })
      successMessage.value = `Room "${roomForm.value.name}" created successfully.`
    }
    isRoomModalOpen.value = false
    await fetchData()
    setTimeout(() => { successMessage.value = '' }, 4000)
  } catch (err: any) {
    roomFormError.value = err.data?.statusMessage || err.message || 'Failed to save room'
  } finally {
    roomSubmitting.value = false
  }
}

// Prompt Delete Confirmation
const promptDelete = (type: 'building' | 'room', id: string, name: string) => {
  deleteTarget.value = { type, id, name }
  isDeleteModalOpen.value = true
}

// Confirm Delete
const handleConfirmDelete = async () => {
  if (!deleteTarget.value) return
  deleteSubmitting.value = true
  try {
    if (deleteTarget.value.type === 'building') {
      await $fetch(`/api/admin/buildings/${deleteTarget.value.id}`, { method: 'DELETE' })
      successMessage.value = `Building "${deleteTarget.value.name}" deleted.`
    } else {
      await $fetch(`/api/admin/rooms/${deleteTarget.value.id}`, { method: 'DELETE' })
      successMessage.value = `Room "${deleteTarget.value.name}" deleted.`
    }
    isDeleteModalOpen.value = false
    deleteTarget.value = null
    await fetchData()
    setTimeout(() => { successMessage.value = '' }, 4000)
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || 'Deletion failed'
  } finally {
    deleteSubmitting.value = false
  }
}

useSeoMeta({
  title: 'Building & Room Management - Admin Portal',
  description: 'Manage buildings, room names, emails and facilities.'
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#F5F2EB] text-[#2A2825] selection:bg-[#FBDA0C] selection:text-[#2A2825]">

    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 bg-[#EFEBE4] border-b border-[#E2DACF] px-4 lg:px-8 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">

        <!-- Brand & Page Breadcrumb -->
        <div class="flex items-center gap-3">
          <div class="p-1.5 rounded-2xl bg-[#FFF8D6] border border-[#FBDA0C] flex items-center justify-center shrink-0">
            <img src="/favicon.svg" alt="App Icon" class="w-7 h-7 rounded-xl object-cover" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <NuxtLink to="/admin" class="text-xs font-semibold text-[#736D66] hover:text-[#2A2825] transition-colors">
                Admin Portal
              </NuxtLink>
              <span class="text-xs text-[#736D66]">\</span>
              <span class="text-xs font-bold text-[#2A2825]">Building & Room Management</span>
            </div>
            <h1 class="text-xl font-extrabold text-[#2A2825] tracking-tight">Facilities Directory</h1>
          </div>
        </div>

        <!-- Right Side Nav Actions -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/admin"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEBE4] text-[#2A2825] text-xs font-semibold border border-[#E2DACF] transition-colors">
            <svg class="w-4 h-4 text-[#736D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Admin Overview
          </NuxtLink>

          <NuxtLink to="/room"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEBE4] text-[#2A2825] text-xs font-semibold border border-[#E2DACF] transition-colors">
            Display Board
          </NuxtLink>
        </div>

      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">

      <!-- Success Notification Banner -->
      <div v-if="successMessage"
        class="p-4 rounded-2xl bg-[#FFF8D6] border border-[#FBDA0C] text-xs text-[#6B5900] flex items-center justify-between shadow-sm animate-fade-in">
        <div class="flex items-center gap-2.5">
          <svg class="w-5 h-5 text-[#6B5900] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="font-bold">{{ successMessage }}</span>
        </div>
        <button @click="successMessage = ''"
          class="text-[#6B5900] hover:text-[#2A2825] text-sm font-bold">&times;</button>
      </div>

      <!-- Error Notification Banner -->
      <div v-if="errorMessage"
        class="p-4 rounded-2xl bg-[#F5E6E3] border border-[#E5C7C2] text-xs text-[#8C4E43] flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2.5">
          <svg class="w-5 h-5 text-[#8C4E43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-bold">{{ errorMessage }}</span>
        </div>
        <button @click="errorMessage = ''"
          class="text-[#8C4E43] hover:text-[#2A2825] text-sm font-bold">&times;</button>
      </div>


      <!-- SECTION 1: BUILDINGS MANAGEMENT -->
      <section class="space-y-4">
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DACF]">
          <div>
            <h2 class="text-lg font-bold text-[#2A2825] flex items-center gap-2">
              Buildings
              <span
                class="text-xs px-2 py-0.5 rounded-full bg-[#EFEBE4] text-[#736D66] font-semibold border border-[#E2DACF]">
                {{ buildings.length }}
              </span>
            </h2>
            <p class="text-xs text-[#736D66]">Manage campus structures and physical building locations.</p>
          </div>

          <button @click="openCreateBuildingModal"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FBDA0C] hover:bg-[#E5C700] text-[#2A2825] text-xs font-bold border border-[#E6C200] transition-all shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Building
          </button>
        </div>

        <!-- Buildings List Grid -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="n in 3" :key="n" class="japandi-card rounded-2xl p-5 animate-pulse bg-[#FAF8F5] h-32"></div>
        </div>

        <div v-else-if="buildings.length === 0"
          class="japandi-card rounded-2xl p-8 text-center bg-[#FAF8F5] border border-[#E2DACF]">
          <p class="text-xs text-[#736D66]">No buildings configured yet. Click "Add Building" to create one.</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="bld in buildings" :key="bld.id"
            class="japandi-card rounded-2xl p-5 bg-[#FAF8F5] border border-[#E2DACF] flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="text-base font-bold text-[#2A2825] tracking-tight">{{ bld.name }}</h3>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF5C2] text-[#6B5900] border border-[#E6C200] shrink-0">
                  {{ bld.roomCount || 0 }} {{ (bld.roomCount || 0) === 1 ? 'Room' : 'Rooms' }}
                </span>
              </div>
              <p class="text-xs text-[#736D66] line-clamp-2 leading-relaxed">
                {{ bld.description || 'No description provided.' }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-[#E2DACF] flex items-center justify-between text-xs">
              <button @click="openCreateRoomModal(bld.id)"
                class="text-xs font-semibold text-[#6B5900] hover:underline flex items-center gap-1">
                + Add Room
              </button>

              <div class="flex items-center gap-2">
                <button @click="openEditBuildingModal(bld)"
                  class="px-2.5 py-1 rounded-lg bg-[#EFEBE4] hover:bg-[#E2DACF] text-[#2A2825] text-[11px] font-semibold border border-[#E2DACF] transition-colors">
                  Edit
                </button>
                <button @click="promptDelete('building', bld.id, bld.name)"
                  class="px-2.5 py-1 rounded-lg bg-[#F5E6E3] hover:bg-[#EAD7D4] text-[#8C4E43] text-[11px] font-semibold border border-[#E5C7C2] transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 2: ROOMS MANAGEMENT -->
      <section class="space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2DACF]">
          <div>
            <h2 class="text-lg font-bold text-[#2A2825] flex items-center gap-2">
              Rooms
              <span
                class="text-xs px-2 py-0.5 rounded-full bg-[#EFEBE4] text-[#736D66] font-semibold border border-[#E2DACF]">
                {{ filteredRooms.length }}
              </span>
            </h2>
            <p class="text-xs text-[#736D66]">Manage rooms and properties.
            </p>
          </div>

          <!-- Controls: Search & Building Filter & Add Room -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Search Input -->
            <div class="relative min-w-[200px]">
              <input v-model="searchQuery" type="text" placeholder="Search room name or email..."
                class="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E2DACF] text-xs text-[#2A2825] placeholder-[#736D66] focus:outline-none focus:border-[#FBDA0C]" />
              <svg class="w-4 h-4 text-[#736D66] absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Building Filter Dropdown -->
            <select v-model="selectedBuildingFilter"
              class="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E2DACF] text-xs font-medium text-[#2A2825] focus:outline-none focus:border-[#FBDA0C]">
              <option value="all">All Buildings</option>
              <option v-for="bld in buildings" :key="bld.id" :value="bld.id">
                {{ bld.name }}
              </option>
            </select>

            <!-- Add Room Button -->
            <button @click="openCreateRoomModal()"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBDA0C] hover:bg-[#E5C700] text-[#2A2825] text-xs font-bold border border-[#E6C200] transition-all shadow-sm shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Room
            </button>
          </div>
        </div>

        <!-- Rooms Table / List -->
        <div v-if="loading" class="space-y-3">
          <div v-for="n in 3" :key="n" class="japandi-card rounded-2xl p-4 animate-pulse bg-[#FAF8F5] h-16"></div>
        </div>

        <div v-else-if="filteredRooms.length === 0"
          class="japandi-card rounded-2xl p-10 text-center bg-[#FAF8F5] border border-[#E2DACF]">
          <svg class="w-10 h-10 text-[#736D66] mx-auto mb-3 opacity-60" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-xs font-semibold text-[#2A2825]">No rooms match your current criteria.</p>
          <p class="text-xs text-[#736D66] mt-1">Try adjusting your search query or building filter, or click "Add Room"
            to create a new entry.</p>
        </div>

        <div v-else class="overflow-x-auto rounded-2xl border border-[#E2DACF] bg-[#FAF8F5] shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-[#EFEBE4] border-b border-[#E2DACF] text-[11px] uppercase tracking-wider text-[#736D66] font-extrabold">
                <th class="py-3 px-4">Room Name</th>
                <th class="py-3 px-4">Building</th>
                <th class="py-3 px-4">Room Email</th>
                <th class="py-3 px-4">Description</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2DACF] text-xs">
              <tr v-for="rm in filteredRooms" :key="rm.id" class="hover:bg-[#FFF5C2]/40 transition-colors">
                <!-- Room Name -->
                <td class="py-3.5 px-4 font-bold text-[#2A2825]">
                  {{ rm.name }}
                </td>

                <!-- Building -->
                <td class="py-3.5 px-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFEBE4] text-[#2A2825] font-semibold text-[11px] border border-[#E2DACF]">
                    <svg class="w-3.5 h-3.5 text-[#736D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7" />
                    </svg>
                    {{ rm.buildingName || 'Unassigned' }}
                  </span>
                </td>

                <!-- Room Email -->
                <td class="py-3.5 px-4 text-[#736D66] font-mono text-[11px]">
                  {{ rm.email }}
                </td>

                <!-- Description -->
                <td class="py-3.5 px-4 text-[#736D66] max-w-xs truncate">
                  {{ rm.description || '—' }}
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="openEditRoomModal(rm)"
                      class="px-2.5 py-1 rounded-lg bg-[#EFEBE4] hover:bg-[#E2DACF] text-[#2A2825] text-[11px] font-semibold border border-[#E2DACF] transition-colors">
                      Edit
                    </button>
                    <button @click="promptDelete('room', rm.id, rm.name)"
                      class="px-2.5 py-1 rounded-lg bg-[#F5E6E3] hover:bg-[#EAD7D4] text-[#8C4E43] text-[11px] font-semibold border border-[#E5C7C2] transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>

    <!-- CREATE / EDIT BUILDING MODAL -->
    <div v-if="isBuildingModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        class="japandi-card w-full max-w-md rounded-3xl p-6 bg-[#FAF8F5] border border-[#E2DACF] shadow-xl space-y-5 animate-scale-up">
        <div class="flex items-center justify-between pb-3 border-b border-[#E2DACF]">
          <h3 class="text-base font-extrabold text-[#2A2825]">
            {{ editingBuilding ? 'Edit Building' : 'Create New Building' }}
          </h3>
          <button @click="isBuildingModalOpen = false"
            class="text-[#736D66] hover:text-[#2A2825] text-lg font-bold">&times;</button>
        </div>

        <div v-if="buildingFormError"
          class="p-3 rounded-xl bg-[#F5E6E3] border border-[#E5C7C2] text-xs text-[#8C4E43]">
          {{ buildingFormError }}
        </div>

        <form @submit.prevent="handleSaveBuilding" class="space-y-4 text-xs">
          <!-- Building Name -->
          <div>
            <label class="block font-bold text-[#2A2825] mb-1">Building Name <span class="text-red-500">*</span></label>
            <input v-model="buildingForm.name" type="text" placeholder="e.g. Innovation Tower"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#EFEBE4] border border-[#E2DACF] text-xs text-[#2A2825] placeholder-[#736D66] focus:outline-none focus:border-[#FBDA0C]"
              required />
          </div>

          <!-- Building Description -->
          <div>
            <label class="block font-bold text-[#2A2825] mb-1">Description <span
                class="text-[#736D66] font-normal">(Optional)</span></label>
            <textarea v-model="buildingForm.description" rows="3"
              placeholder="Facility address, main focus, or location details..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#EFEBE4] border border-[#E2DACF] text-xs text-[#2A2825] placeholder-[#736D66] focus:outline-none focus:border-[#FBDA0C]"></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E2DACF]">
            <button type="button" @click="isBuildingModalOpen = false"
              class="px-4 py-2 rounded-xl bg-[#EFEBE4] hover:bg-[#E2DACF] text-[#2A2825] font-semibold border border-[#E2DACF] transition-colors">
              Cancel
            </button>
            <button type="submit" :disabled="buildingSubmitting"
              class="px-5 py-2 rounded-xl bg-[#FBDA0C] hover:bg-[#E5C700] text-[#2A2825] font-bold border border-[#E6C200] transition-colors disabled:opacity-50">
              {{ buildingSubmitting ? 'Saving...' : (editingBuilding ? 'Update Building' : 'Create Building') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- CREATE / EDIT ROOM MODAL -->
    <div v-if="isRoomModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        class="japandi-card w-full max-w-lg rounded-3xl p-6 bg-[#FAF8F5] border border-[#E2DACF] shadow-xl space-y-5 animate-scale-up">
        <div class="flex items-center justify-between pb-3 border-b border-[#E2DACF]">
          <h3 class="text-base font-extrabold text-[#2A2825]">
            {{ editingRoom ? 'Edit Room' : 'Add New Room' }}
          </h3>
          <button @click="isRoomModalOpen = false"
            class="text-[#736D66] hover:text-[#2A2825] text-lg font-bold">&times;</button>
        </div>

        <div v-if="roomFormError" class="p-3 rounded-xl bg-[#F5E6E3] border border-[#E5C7C2] text-xs text-[#8C4E43]">
          {{ roomFormError }}
        </div>

        <form @submit.prevent="handleSaveRoom" class="space-y-4 text-xs">
          <!-- Select Building -->
          <div>
            <label class="block font-bold text-[#2A2825] mb-1">Building <span class="text-red-500">*</span></label>
            <select v-model="roomForm.buildingId"
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#EFEBE4] border border-[#E2DACF] text-xs font-semibold text-[#2A2825] focus:outline-none focus:border-[#FBDA0C]"
              required>
              <option value="" disabled>Select a building...</option>
              <option v-for="bld in buildings" :key="bld.id" :value="bld.id">
                {{ bld.name }}
              </option>
            </select>
          </div>

          <!-- Room Name & Room Email Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-[#2A2825] mb-1">Room Name <span class="text-red-500">*</span></label>
              <input v-model="roomForm.name" type="text" placeholder="e.g. Conference Room 3A"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#EFEBE4] border border-[#E2DACF] text-xs text-[#2A2825] placeholder-[#736D66] focus:outline-none focus:border-[#FBDA0C]"
                required />
            </div>

            <div>
              <label class="block font-bold text-[#2A2825] mb-1">Room Email <span class="text-red-500">*</span></label>
              <input v-model="roomForm.email" type="email" placeholder="e.g. conf3a@company.com"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#EFEBE4] border border-[#E2DACF] text-xs text-[#2A2825] placeholder-[#736D66] focus:outline-none focus:border-[#FBDA0C]"
                required />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block font-bold text-[#2A2825] mb-1">Description <span
                class="text-[#736D66] font-normal">(Optional)</span></label>
            <textarea v-model="roomForm.description" rows="3"
              placeholder="Seating capacity, AV equipment, whiteboard, room notes..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#EFEBE4] border border-[#E2DACF] text-xs text-[#2A2825] placeholder-[#736D66] focus:outline-none focus:border-[#FBDA0C]"></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E2DACF]">
            <button type="button" @click="isRoomModalOpen = false"
              class="px-4 py-2 rounded-xl bg-[#EFEBE4] hover:bg-[#E2DACF] text-[#2A2825] font-semibold border border-[#E2DACF] transition-colors">
              Cancel
            </button>
            <button type="submit" :disabled="roomSubmitting"
              class="px-5 py-2 rounded-xl bg-[#FBDA0C] hover:bg-[#E5C700] text-[#2A2825] font-bold border border-[#E6C200] transition-colors disabled:opacity-50">
              {{ roomSubmitting ? 'Saving...' : (editingRoom ? 'Update Room' : 'Save Room') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        class="japandi-card w-full max-w-sm rounded-3xl p-6 bg-[#FAF8F5] border border-[#E2DACF] shadow-xl text-center space-y-4 animate-scale-up">
        <div
          class="w-12 h-12 mx-auto rounded-2xl bg-[#F5E6E3] border border-[#E5C7C2] text-[#8C4E43] flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div>
          <h3 class="text-base font-extrabold text-[#2A2825]">Confirm Deletion</h3>
          <p class="text-xs text-[#736D66] mt-1.5 leading-relaxed">
            Are you sure you want to delete <strong class="text-[#2A2825] font-bold">"{{ deleteTarget?.name
            }}"</strong>? This action cannot be undone.
          </p>
        </div>

        <div class="flex items-center justify-center gap-3 pt-2">
          <button @click="isDeleteModalOpen = false"
            class="px-4 py-2 rounded-xl bg-[#EFEBE4] hover:bg-[#E2DACF] text-[#2A2825] text-xs font-semibold border border-[#E2DACF] transition-colors">
            Cancel
          </button>
          <button @click="handleConfirmDelete" :disabled="deleteSubmitting"
            class="px-5 py-2 rounded-xl bg-[#8C4E43] hover:bg-[#723F36] text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-sm">
            {{ deleteSubmitting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
