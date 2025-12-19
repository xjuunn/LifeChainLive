<template>
  <div class="relative flex flex-col items-center gap-2 group w-full">
    <div class="relative transition-all duration-300 transform group-hover:scale-105">
      <div
        class="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full relative z-10 flex items-center justify-center overflow-hidden border-2"
        :class="[
          isSpeaking ? 'border-success shadow-[0_0_20px_rgba(var(--success-rgb),0.6)]' : 'border-white/10 group-hover:border-white/30',
          seat.isLocked ? 'bg-base-300/50' : 'bg-base-200/30'
        ]">
        <template v-if="hasUser">
          <NuxtImg :src="avatarUrl" class="w-full h-full object-cover" loading="lazy" :alt="seat.userName" />
          <div v-if="isMuted" class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <div class="bg-black/60 p-1 rounded-full border border-white/10">
              <Icon name="mingcute:mic-off-fill" class="text-error text-xs sm:text-base" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="text-white/20 flex flex-col items-center justify-center gap-1">
            <Icon v-if="seat.isLocked" name="mingcute:lock-fill" class="text-lg sm:text-2xl" />
            <Icon v-else name="mingcute:sofa-line" class="text-lg sm:text-2xl" />
          </div>
        </template>
      </div>

      <div v-if="isSpeaking" class="absolute -inset-1.5 rounded-full border border-success/30 animate-ping opacity-75">
      </div>

      <div v-if="isHostSeat" class="absolute -top-1 -right-1 z-20">
        <div
          class="bg-primary text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-sm border border-black/20 font-bold leading-none">
          HOST
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center w-16 sm:w-24 text-center space-y-0.5">
      <span class="text-[10px] sm:text-sm font-medium text-white/90 truncate w-full drop-shadow-md">
        {{ displayName }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { ISeat } from './SeatGrid.vue'

const props = defineProps<{
  seat: ISeat
  isSpeaking: boolean
}>()

const { t } = useI18n()

const hasUser = computed(() => !!props.seat.userId)
const isHostSeat = computed(() => props.seat.index === 0)
const isMuted = computed(() => hasUser.value && !props.seat.userMicrophoneStatus)

const displayName = computed(() => {
  if (props.seat.userName) return props.seat.userName
  if (props.seat.userId) return t('detail.guest')
  if (props.seat.isLocked) return t('detail.locked')
  return `${props.seat.index + 1}`
})

const avatarUrl = computed(() => {
  const url = props.seat.avatarUrl
  const seed = props.seat.userId || 'default'
  if (url && url.startsWith('http')) return url
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`
})
</script>