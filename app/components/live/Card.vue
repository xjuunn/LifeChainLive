<template>
  <div
    class="group relative overflow-hidden rounded-xl bg-base-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-base-content/5 cursor-pointer"
    @click="router.push(`/live/${room.roomId}`)">
    <div class="relative aspect-video w-full overflow-hidden bg-base-300">
      <NuxtImg :src="room.coverUrl || 'https://via.placeholder.com/640x360?text=Live'" loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />

      <div
        class="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </span>
        {{ t('live.living') }}
      </div>

      <div
        class="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
        {{ room.roomType === 'liveroom' ? t('live.video') : t('live.voice') }}
      </div>
    </div>

    <div class="p-3">
      <h3 class="line-clamp-1 text-base font-bold text-base-content group-hover:text-primary">
        {{ room.title || t('live.untitled') }}
      </h3>

      <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="avatar">
            <div class="w-6 rounded-full ring-1 ring-base-content/10">
              <NuxtImg :src="room.ownerAvatar" class="bg-base-300" />
            </div>
          </div>
          <span class="max-w-[100px] truncate text-xs text-base-content/70">
            {{ room.ownerNickname || room.ownerId }}
          </span>
        </div>

        <div class="flex items-center gap-1 text-xs text-base-content/50">
          <Icon name="mingcute:user-3-line" />
          <span>{{ formatChineseNumber(room.memberCount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveRoom } from '~/api/live'

defineProps<{ room: LiveRoom }>()
const router = useRouter()
const { t } = useI18n()
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