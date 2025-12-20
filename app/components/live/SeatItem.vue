<template>
  <div class="relative flex flex-col items-center gap-2 group w-full transition-all duration-300">
    <div class="relative transition-all duration-300 transform group-hover:scale-105">
      <!-- 头像容器 -->
      <div
        class="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full relative z-10 flex items-center justify-center overflow-hidden border-2 bg-base-300 transition-colors"
        :class="borderClass">
        <template v-if="hasUser">
          <NuxtImg :src="avatarUrl" class="w-full h-full object-cover" loading="lazy"
            :alt="seat.userInfo?.userName || 'user'" />

          <!-- 闭麦状态遮罩 -->
          <div v-if="isMuted"
            class="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px] transition-all">
            <div class="bg-black/60 p-1.5 rounded-full border border-white/20 shadow-md">
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

      <!-- 说话波纹动画 -->
      <div v-if="isSpeaking"
        class="absolute -inset-1.5 rounded-full border-2 border-success/40 animate-ping opacity-75 pointer-events-none">
      </div>
      <div v-if="isSpeaking"
        class="absolute -inset-1.5 rounded-full border-2 border-success/20 animate-pulse pointer-events-none"></div>

      <!-- 房主标识 -->
      <div v-if="isHostSeat" class="absolute -top-1.5 -right-1.5 z-20">
        <div
          class="bg-gradient-to-r from-primary to-secondary text-white text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-white/10 font-extrabold tracking-wider transform scale-90 sm:scale-100">
          HOST
        </div>
      </div>
    </div>

    <!-- 用户名/状态 -->
    <div class="flex flex-col items-center w-16 sm:w-24 text-center space-y-0.5">
      <span class="text-[10px] sm:text-sm font-medium text-white/90 truncate w-full drop-shadow-md px-1">
        {{ displayName }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SeatInfo } from 'tuikit-atomicx-vue3';


const props = defineProps<{
  seat: SeatInfo
  isSpeaking: boolean
}>()

const { t } = useI18n()

const hasUser = computed(() => !!props.seat.userInfo?.userId && props.seat.userInfo.userId !== '')
const isHostSeat = computed(() => props.seat.index === 0)
const isMuted = computed(() => hasUser.value && !props.seat.userInfo?.microphoneStatus)

const borderClass = computed(() => {
  if (props.isSpeaking) return 'border-success shadow-[0_0_20px_rgba(var(--success-rgb),0.6)]'
  if (props.seat.isLocked) return 'border-base-content/10 bg-base-200/50'
  return 'border-white/10 group-hover:border-white/30'
})

const displayName = computed(() => {
  if (props.seat.userInfo?.userName) return props.seat.userInfo?.userName
  if (props.seat.userInfo?.userId) return t('detail.guest')
  if (props.seat.isLocked) return t('detail.locked')
  return `${props.seat.index + 1}`
})

const avatarUrl = computed(() => {
  const url = props.seat.userInfo?.avatarUrl
  if (url && url.startsWith('http')) return url
  const seed = props.seat.userInfo?.userId || `seat-${props.seat.index}`
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`
})
</script>