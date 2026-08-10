<template>
  <span 
    v-if="status?.isBusyNow" 
    class="inline-flex items-center gap-1.5 rounded-full text-xs badge-busy"
    :class="sizeClasses"
  >
    <span class="w-2 h-2 rounded-full bg-[#8C4E43]"></span>
    BUSY NOW
  </span>
  <span 
    v-else-if="status?.isFreeRestOfDay" 
    class="inline-flex items-center gap-1.5 rounded-full text-xs badge-free-day"
    :class="sizeClasses"
  >
    <span class="w-2 h-2 rounded-full bg-[#6B5C43]"></span>
    FREE
  </span>
  <span 
    v-else 
    class="inline-flex items-center gap-1.5 rounded-full text-xs badge-available"
    :class="sizeClasses"
  >
    <span class="w-2 h-2 rounded-full bg-[#D9B500]"></span>
    AVAILABLE
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComputedRoomStatus } from '../types/room'

const props = withDefaults(defineProps<{
  status?: ComputedRoomStatus | null
  size?: 'sm' | 'md'
}>(), {
  size: 'md'
})

const sizeClasses = computed(() => {
  return props.size === 'sm' 
    ? 'px-2.5 py-0.5 font-bold' 
    : 'px-3 py-1 font-extrabold shadow-sm'
})
</script>
