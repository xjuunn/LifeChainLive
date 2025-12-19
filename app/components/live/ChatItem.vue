<template>
  <div class="flex items-start gap-3 w-full group animate-fade-in-up">
    <div class="avatar mt-0.5 shrink-0 cursor-pointer transition-transform active:scale-95">
      <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-1 ring-base-content/10 bg-base-300 shadow-sm overflow-hidden">
        <NuxtImg :src="avatar" class="object-cover w-full h-full" loading="lazy" alt="avatar" />
      </div>
    </div>
    <div class="flex flex-col max-w-[85%]">
      <div class="flex items-center gap-2 mb-1 flex-wrap">
        <span class="text-xs text-base-content/60 font-medium truncate max-w-30">
          {{ senderName }}
        </span>

        <span v-if="isAnchor"
          class="badge badge-xs sm:badge-sm badge-primary border-none gap-1 font-bold shadow-sm shadow-primary/30">
          <Icon name="mingcute:mic-fill" class="text-[10px]" />
          {{ $t('detail.anchor') }}
        </span>

        <span v-else
          class="badge badge-xs badge-ghost text-[10px] text-base-content/40 border-base-content/10 bg-base-200/50">
          LV.1
        </span>
      </div>

      <div class="relative rounded-2xl rounded-tl-none px-3 py-2 text-sm shadow-sm border transition-colors"
        :class="bubbleClass">
        <component :is="renderContent" :data="message" />
      </div>
    </div>
  </div>
</template>
<script setup lang="tsx">
const props = defineProps<{
  message: any
  ownerId: string
}>()

const guestText = computed(() => $t('detail.guest'))
const unknownText = computed(() => $t('detail.unknown_msg'))

const isAnchor = computed(() => {
  return (
    props.message.sender?.userId &&
    props.ownerId &&
    props.message.sender.userId === props.ownerId
  )
})

const avatar = computed(() => {
  const url = props.message.sender?.avatarUrl
  const seed = props.message.sender?.userId || 'default'
  if (url && url.startsWith('http')) return url
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`
})

const senderName = computed(() => {
  return (
    props.message.sender?.userName ||
    props.message.sender?.userId ||
    guestText.value
  )
})

const bubbleClass = computed(() => {
  return isAnchor.value
    ? 'bg-primary/10 border-primary/20 text-base-content'
    : 'bg-white dark:bg-base-200 border-base-content/5 text-base-content/90'
})

const renderContent = computed(() => {
  const { message } = props

  if (message.textContent !== undefined) {
    return () => (
      <span class="whitespace-pre-wrap break-all">
        {message.textContent}
      </span>
    )
  }

  if (message.imageInfo) {
    return () => (
      <div class="max-w-50 rounded-lg overflow-hidden">
        <img
          src={message.imageInfo.url}
          class="w-full h-auto"
          loading="lazy"
        />
      </div>
    )
  }

  return () => (
    <span class="italic opacity-50 text-xs">
      {unknownText.value}
    </span>
  )
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(5px);
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
      "anchor": "主播",
      "guest": "游客",
      "unknown_msg": "未知消息"
    }
  },
  "zh-TW": {
    "detail": {
      "anchor": "主播",
      "guest": "訪客",
      "unknown_msg": "未知訊息"
    }
  },
  "en": {
    "detail": {
      "anchor": "Host",
      "guest": "Guest",
      "unknown_msg": "Unknown message"
    }
  }
}</i18n>