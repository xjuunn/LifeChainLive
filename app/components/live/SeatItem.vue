<template>
  <div class="relative flex flex-col items-center gap-2 group">
    <div class="relative">
      <div class="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full transition-all duration-300 relative z-10"
        :class="[
          isSpeaking ? 'ring-2 ring-success shadow-[0_0_15px_rgba(var(--success-rgb),0.5)] scale-105' : 'ring-2 ring-white/10 group-hover:ring-white/30',
          seat.isLocked ? 'bg-base-200/50' : 'bg-base-300'
        ]">
        <template v-if="seat.userId">
          <NuxtImg :src="avatarUrl" class="w-full h-full rounded-full object-cover" loading="lazy" />
          <div class="absolute inset-0 rounded-full bg-black/20" v-if="isMuted"></div>
          <div class="absolute -bottom-1 -right-1 bg-black/60 backdrop-blur-sm rounded-full p-1 border border-white/10"
            v-if="isMuted">
            <Icon name="mingcute:mic-off-fill" class="text-error text-xs" />
          </div>
        </template>
        <template v-else>
          <div
            class="w-full h-full flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm text-white/20">
            <Icon v-if="seat.isLocked" name="mingcute:lock-fill" class="text-xl" />
            <Icon v-else name="mingcute:sofa-line" class="text-xl" />
          </div>
        </template>
      </div>

      <div v-if="isSpeaking" class="absolute -inset-1 rounded-full border border-success/30 animate-ping"></div>
    </div>

    <div class="flex flex-col items-center max-w-[80px]">
      <span class="text-xs font-medium text-white/90 truncate w-full text-center shadow-black drop-shadow-md">
        {{ seat.userName || (seat.userId ? t('detail.guest') : index + 1) }}
      </span>
      <span v-if="isHost"
        class="mt-0.5 px-1.5 py-0.5 rounded-full bg-primary/80 text-[10px] leading-none font-bold text-white shadow-sm">
        HOST
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  seat: any;
  index: number;
  isSpeaking: boolean;
  hostId?: string;
}>()

const { t } = useI18n()

const isHost = computed(() => props.hostId && props.seat.userId === props.hostId)

const isMuted = computed(() => !props.seat.userMicrophoneStatus && props.seat.userId)

const avatarUrl = computed(() => {
  const url = props.seat.avatarUrl
  const seed = props.seat.userId || 'default'
  if (url && url.startsWith('http')) return url
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`
})
</script>