<template>
  <div class="h-full w-full flex items-center justify-center p-2 sm:p-6 relative overflow-hidden z-20">
    <div class="absolute inset-0 z-0 h-full">
      <div class="absolute h-full inset-0 bg-gradient-to-b from-gray-900/90 via-gray-800/90 to-gray-900/90"></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse">
      </div>
    </div>

    <div class="relative z-10 w-full max-w-5xl mx-auto">
      <div class="grid grid-cols-5 gap-x-2 gap-y-6 sm:gap-x-8 sm:gap-y-10 justify-items-center">
        <SeatItem
          v-for="seat in seatList"
          :key="seat.index"
          :seat="seat"
          :is-speaking="checkIsSpeaking(seat.userInfo?.userId)"
          @click="handleSeatClick"
        />
      </div>
    </div>

    <SeatActionMenu
      :visible="menuVisible"
      :seat="selectedSeat!"
      :position="menuPosition"
      :self-user-id="selfUserId"
      :link-status="linkStatus"
      :is-muted="isMuted"
      @close="menuVisible = false"
      @action="handleSeatAction"
    />
  </div>
</template>

<script setup lang="ts">
import { useLiveSeatState } from 'tuikit-atomicx-vue3'
import type { SeatInfo } from 'tuikit-atomicx-vue3'
import type { LiveRoom } from '~/api/live'
import { LinkStatus } from '~/api/linkmic'

const SeatItem = defineAsyncComponent(() => import('./SeatItem.vue'))
const SeatActionMenu = defineAsyncComponent(() => import('./SeatActionMenu.vue'))

const props = defineProps<{
  roomInfo: LiveRoom
  linkStatus: LinkStatus
  isMuted?: boolean
}>()

const emit = defineEmits<{
  seatAction: [action: string, seat: SeatInfo]
}>()

const { seatList, speakingUsers } = useLiveSeatState()

const menuVisible = ref(false)
const selectedSeat = ref<SeatInfo | null>(null)
const menuPosition = ref({ x: 0, y: 0 })
const selfUserId = ref(localStorage.getItem('userId') || '')

const checkIsSpeaking = (userId?: string) => {
  if (!userId || !speakingUsers.value) return false
  return speakingUsers.value.has(userId)
}

const handleSeatClick = (seat: SeatInfo, event: MouseEvent) => {
  selectedSeat.value = seat
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const menuWidth = 160
  const menuHeight = 120
  
  let x = rect.left + rect.width / 2 - menuWidth / 2
  let y = rect.bottom + 8
  
  if (x < 8) x = 8
  if (x + menuWidth > window.innerWidth - 8) x = window.innerWidth - menuWidth - 8
  if (y + menuHeight > window.innerHeight - 8) y = rect.top - menuHeight - 8
  
  menuPosition.value = { x, y }
  menuVisible.value = true
}

const handleSeatAction = (action: string, seat: SeatInfo) => {
  emit('seatAction', action, seat)
}
</script>