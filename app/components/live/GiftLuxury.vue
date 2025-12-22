<template>
  <Teleport to="body">
    <Transition name="luxury">
      <div v-if="show" class="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
        <div 
          class="absolute top-20 left-0 right-0 py-4 px-6 text-center"
          :style="{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.8) 80%, transparent)' }"
        >
          <div class="flex items-center justify-center gap-3 animate-bounce-in">
            <span class="text-2xl">🎉</span>
            <span class="text-lg font-bold text-warning drop-shadow-lg">
              {{ senderName }} {{ t('gift.sent_luxury') }} {{ giftName }}
            </span>
            <span class="text-xl font-bold text-primary">×{{ giftCount }}</span>
            <span class="text-2xl">🎉</span>
          </div>
        </div>

        <div
          v-for="particle in particles"
          :key="particle.id"
          class="absolute particle"
          :style="{
            left: particle.x + 'px',
            animationDelay: particle.delay + 's',
            animationDuration: particle.duration + 's'
          }"
        >
          <NuxtImg :src="giftIcon" class="w-10 h-10 object-contain drop-shadow-xl" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Particle {
  id: number
  x: number
  delay: number
  duration: number
}

const props = defineProps<{
  show: boolean
  giftIcon: string
  giftName: string
  senderName: string
  giftCount: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const { t } = useI18n()
const particles = ref<Particle[]>([])

watch(() => props.show, (val) => {
  if (val) {
    generateParticles()
    setTimeout(() => {
      emit('complete')
    }, 4000)
  } else {
    particles.value = []
  }
})

const generateParticles = () => {
  const count = 20
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400
  
  particles.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * screenWidth,
    delay: Math.random() * 0.5,
    duration: 2.5 + Math.random() * 1
  }))
}
</script>

<style scoped>
.luxury-enter-active,
.luxury-leave-active {
  transition: opacity 0.5s ease;
}

.luxury-enter-from,
.luxury-leave-to {
  opacity: 0;
}

.particle {
  top: -50px;
  animation: fall linear forwards;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg) scale(0.5);
    opacity: 1;
  }
  20% {
    opacity: 1;
    transform: translateY(20vh) rotate(90deg) scale(1.2);
  }
  80% {
    opacity: 0.8;
    transform: translateY(80vh) rotate(270deg) scale(0.8);
  }
  100% {
    transform: translateY(110vh) rotate(360deg) scale(0.5);
    opacity: 0;
  }
}

.animate-bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    transform: scale(1.1) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>

<i18n lang="json">{
  "zh-CN": {
    "gift": {
      "sent_luxury": "送出了"
    }
  },
  "zh-TW": {
    "gift": {
      "sent_luxury": "送出了"
    }
  },
  "en": {
    "gift": {
      "sent_luxury": "sent"
    }
  }
}</i18n>
