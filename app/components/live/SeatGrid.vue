<template>
  <div class="h-full w-full flex items-center justify-center p-2 sm:p-6 relative overflow-hidden z-20">
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-800/90 to-gray-900/90"></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse">
      </div>
    </div>

    <div class="relative z-10 w-full max-w-5xl mx-auto">
      <div class="grid grid-cols-5 gap-x-2 gap-y-6 sm:gap-x-8 sm:gap-y-10 justify-items-center">
        <SeatItem v-for="seat in seatList" :key="seat.index" :seat="seat"
          :is-speaking="checkIsSpeaking(seat.userInfo?.userId)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLiveSeatState, type RegionInfo } from 'tuikit-atomicx-vue3'
import type { LiveRoom } from '~/api/live'


const SeatItem = defineAsyncComponent(() => import('./SeatItem.vue'))

const props = defineProps<{
  roomInfo: LiveRoom
}>()

const { seatList, speakingUsers } = useLiveSeatState()

const checkIsSpeaking = (userId?: string) => {
  if (!userId || !speakingUsers.value) return false
  return speakingUsers.value.has(userId)
}
</script>