<template>
  <div class="flex h-full flex-col overflow-hidden bg-base-100/30">
    <div ref="scrollContainer" class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-hidden">
      <div
        class="animate-fade-in-up rounded-xl bg-primary/10 p-3 text-sm text-base-content/90 backdrop-blur-sm border border-primary/10 shadow-sm">
        <h2 class="mb-1 font-bold text-primary flex items-center gap-1.5 text-xs sm:text-sm">
          <Icon name="mingcute:announcement-line" />
          {{ t('detail.notice') }}
        </h2>
        <p class="leading-relaxed text-xs sm:text-sm">{{ t('detail.welcome') }}</p>
      </div>
      <TransitionGroup name="list" tag="div" class="space-y-4 pb-2">
        <ChatItem v-for="msg in messageList" :key="msg.sequence" :message="msg" :owner-id="ownerId" />
      </TransitionGroup>

      <div ref="bottomRef" class="h-1 w-full"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useBarrageState } from 'tuikit-atomicx-vue3'

const ChatItem = defineAsyncComponent(() => import('./ChatItem.vue'))

defineProps<{
  ownerId: string
}>()

const { t } = useI18n()
const { messageList } = useBarrageState()
const scrollContainer = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)

const scrollToBottom = async (smooth = true) => {
  await nextTick()
  if (bottomRef.value) {
    bottomRef.value.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    })
  }
}

watch(messageList, (newVal, oldVal) => {
  if (newVal.length > (oldVal?.length || 0)) {
    scrollToBottom(true)
  }
}, { deep: true })

onMounted(() => {
  scrollToBottom(false)
})
</script>
<style scoped>
.scrollbar-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.list-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
  position: absolute;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
<i18n lang="json">{
  "zh-CN": {
    "detail": {
      "notice": "系统公告",
      "welcome": "欢迎来到直播间，请遵守社区规范，文明发言。",
      "guest": "游客",
      "anchor": "主播",
      "unknown_msg": "[未知消息类型]"
    }
  },
  "zh-TW": {
    "detail": {
      "notice": "系統公告",
      "welcome": "歡迎來到直播間，請遵守社區規範，文明發言。",
      "guest": "遊客",
      "anchor": "主播",
      "unknown_msg": "[未知消息類型]"
    }
  },
  "en": {
    "detail": {
      "notice": "System Notice",
      "welcome": "Welcome to the live room. Please follow community guidelines.",
      "guest": "Guest",
      "anchor": "Host",
      "unknown_msg": "[Unknown Message]"
    }
  }
}</i18n>