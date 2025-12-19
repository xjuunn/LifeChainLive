<template>
  <div
    class="group relative flex flex-col overflow-hidden rounded-2xl bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-base-content/5 cursor-pointer h-full"
    @click="navigateToRoom">
    <div class="relative aspect-video w-full overflow-hidden bg-base-300">
      <NuxtImg :src="coverImage" :placeholder="[16, 9, 75, 5]" format="webp" loading="lazy"
        class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        @error="handleImageError" />

      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

      <div
        class="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-error"></span>
        </span>
        {{ t('live.living') }}
      </div>

      <div
        class="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
        {{ room.roomType === 'liveroom' ? t('live.video') : t('live.voice') }}
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-1 text-base font-bold text-base-content transition-colors group-hover:text-primary">
        {{ room.title || t('live.untitled') }}
      </h3>

      <div class="mt-auto pt-4 flex items-center justify-between">
        <div class="flex items-center gap-2 overflow-hidden">
          <div class="avatar">
            <div class="w-8 h-8 rounded-full ring-2 ring-base-content/5 group-hover:ring-primary/50 transition-all">
              <NuxtImg :src="avatarImage" class="bg-base-200" />
            </div>
          </div>
          <span class="truncate text-xs font-medium text-base-content/70 group-hover:text-base-content">
            {{ room.ownerNickname || room.ownerId }}
          </span>
        </div>

        <div class="flex flex-shrink-0 items-center gap-1 text-xs font-medium text-base-content/50">
          <Icon name="mingcute:user-3-fill" />
          <span>{{ formatChineseNumber(room.memberCount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveRoom } from '~/api/live'

const props = defineProps<{ room: LiveRoom }>()
const router = useRouter()
const { t } = useI18n({ useScope: 'local' })

const imageError = ref(false)

const coverImage = computed(() => {
  if (imageError.value || !props.room.coverUrl) {
    return `https://placehold.co/640x360/1e1e1e/FFF?text=Live`
  }
  return props.room.coverUrl
})

const avatarImage = computed(() => {
  return props.room.ownerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${props.room.ownerId}`
})

const handleImageError = () => {
  imageError.value = true
}

const navigateToRoom = () => {
  router.push(`/live/${props.room.roomId}`)
}
</script>

<i18n lang="json">{
  "zh-CN": {
    "live": {
      "living": "直播中",
      "video": "视频",
      "voice": "语聊",
      "untitled": "暂无标题"
    }
  },
  "zh-TW": {
    "live": {
      "living": "直播中",
      "video": "視訊",
      "voice": "語聊",
      "untitled": "暫無標題"
    }
  },
  "en": {
    "live": {
      "living": "LIVE",
      "video": "Video",
      "voice": "Voice",
      "untitled": "Untitled"
    }
  }
}</i18n>