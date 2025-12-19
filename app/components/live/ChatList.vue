<template>
  <div class="relative flex h-full flex-col overflow-hidden bg-base-100/30">
    <div ref="scrollContainer"
      class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-hidden overscroll-contain"
      @scroll="handleScroll">
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
    </div>

    <Transition name="fade">
      <div v-if="hasNewMessages && !isAtBottom" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
        @click="forceScrollToBottom">
        <div class="badge badge-primary gap-1 shadow-lg shadow-primary/30 border-none px-3 py-3 animate-bounce">
          <Icon name="mingcute:arrow-down-double-line" />
          <span class="text-xs font-bold">{{ t('detail.new_messages') }}</span>
        </div>
      </div>
    </Transition>
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
const isAtBottom = ref(true)
const hasNewMessages = ref(false)

const handleScroll = () => {
  if (!scrollContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  const isBottom = distanceToBottom < 50

  if (isBottom) {
    isAtBottom.value = true
    hasNewMessages.value = false
  } else {
    isAtBottom.value = false
  }
}

const forceScrollToBottom = async () => {
  if (!scrollContainer.value) return

  isAtBottom.value = true
  hasNewMessages.value = false

  await nextTick()

  scrollContainer.value.scrollTo({
    top: scrollContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

watch(
  () => messageList.value.length,
  async (newLen, oldLen) => {
    if (!scrollContainer.value) return

    if (newLen > (oldLen || 0)) {
      await nextTick()

      if (isAtBottom.value) {
        scrollContainer.value.scrollTo({
          top: scrollContainer.value.scrollHeight,
          behavior: 'smooth'
        })
      } else {
        hasNewMessages.value = true
      }
    }
  },
  { flush: 'post' }
)

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
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

.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.list-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
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
      "unknown_msg": "[未知消息类型]",
      "new_messages": "新消息"
    }
  },
  "zh-TW": {
    "detail": {
      "notice": "系統公告",
      "welcome": "歡迎來到直播間，請遵守社區規範，文明發言。",
      "guest": "遊客",
      "anchor": "主播",
      "unknown_msg": "[未知消息類型]",
      "new_messages": "新消息"
    }
  },
  "en": {
    "detail": {
      "notice": "System Notice",
      "welcome": "Welcome to the live room. Please follow community guidelines.",
      "guest": "Guest",
      "anchor": "Host",
      "unknown_msg": "[Unknown Message]",
      "new_messages": "New Messages"
    }
  }
}</i18n>