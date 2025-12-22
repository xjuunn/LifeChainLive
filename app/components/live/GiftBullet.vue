<template>
  <div class="absolute left-0 bottom-48 lg:bottom-60 z-50 flex flex-col gap-2 pointer-events-none max-w-[80%]">
    <TransitionGroup name="bullet">
      <div
        v-for="bullet in bullets"
        :key="bullet.id"
        class="gift-bullet flex items-center gap-2 pr-4 rounded-full"
        :style="{ background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)' }"
      >
        <div class="avatar">
          <div class="w-8 h-8 rounded-full ring-2 ring-primary/50">
            <NuxtImg :src="getAvatar(bullet.senderAvatar, bullet.senderId)" class="object-cover" />
          </div>
        </div>
        <div class="flex flex-col py-1.5">
          <span class="text-xs text-white/90 font-medium truncate max-w-[100px]">{{ bullet.senderName }}</span>
          <span class="text-[10px] text-white/60">{{ t('gift.sent') }} {{ bullet.giftName }}</span>
        </div>
        <div class="relative w-10 h-10 flex-shrink-0">
          <NuxtImg :src="bullet.giftIcon" class="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <div class="combo-count font-bold text-lg min-w-[40px] text-right" :key="bullet.count">
          <span class="text-warning drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">×{{ bullet.count }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { GiftMessage } from '~/api/gift'

interface GiftBullet {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  giftName: string
  giftIcon: string
  count: number
  timestamp: number
}

const { t } = useI18n()
const bullets = ref<GiftBullet[]>([])
const maxBullets = 3
const bulletDuration = 4000

const getAvatar = (url?: string, seed?: string) => {
  if (url && url.startsWith('http')) return url
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed || 'default'}`
}

const addBullet = (message: GiftMessage) => {
  const existingIndex = bullets.value.findIndex(
    b => b.senderId === message.sender.userId && b.giftName === message.gift.name
  )

  if (existingIndex >= 0) {
    const existing = bullets.value[existingIndex]
    existing.count += message.giftCount
    existing.timestamp = Date.now()
    bullets.value = [...bullets.value]
    return
  }

  const newBullet: GiftBullet = {
    id: Math.random().toString(36).substring(2, 11),
    senderId: message.sender.userId,
    senderName: message.sender.userName,
    senderAvatar: message.sender.avatarUrl,
    giftName: message.gift.name,
    giftIcon: message.gift.iconUrl,
    count: message.giftCount,
    timestamp: Date.now()
  }

  if (bullets.value.length >= maxBullets) {
    bullets.value.shift()
  }
  bullets.value.push(newBullet)
}

let cleanupTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    bullets.value = bullets.value.filter(b => now - b.timestamp < bulletDuration)
  }, 100)
})

onUnmounted(() => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
  }
})

defineExpose({
  addBullet
})
</script>

<style scoped>
.bullet-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bullet-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bullet-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.bullet-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.bullet-move {
  transition: transform 0.3s ease;
}

.combo-count {
  animation: pulse 0.3s ease-out;
}

@keyframes pulse {
  0% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

.gift-bullet {
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

<i18n lang="json">{
  "zh-CN": {
    "gift": {
      "sent": "送出"
    }
  },
  "zh-TW": {
    "gift": {
      "sent": "送出"
    }
  },
  "en": {
    "gift": {
      "sent": "sent"
    }
  }
}</i18n>
