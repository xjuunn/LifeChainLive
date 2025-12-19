<template>
  <div class="flex h-[100dvh] w-full flex-col bg-black lg:flex-row overflow-hidden font-sans">
    <div class="relative w-full h-[45vh] lg:h-full lg:flex-1 bg-gray-950 group/player overflow-hidden">
      <ClientOnly>
        <LivePlayer :room-id="roomId" @loaded="loading = false" class="absolute inset-0 w-full h-full object-contain"
          :class="{ 'opacity-0 pointer-events-none': isVoiceRoom }" />

        <template v-if="roomInfo">
          <div v-if="isVoiceRoom" class="absolute inset-0 z-10 bg-gray-900 flex flex-col">
            <div class="absolute inset-0 overflow-hidden">
              <NuxtImg :src="roomInfo.coverUrl || roomInfo.ownerAvatar"
                class="w-full h-full object-cover opacity-20 blur-3xl scale-125 animate-[pulse_10s_ease-in-out_infinite]" />
              <div class="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900"></div>
            </div>

            <div class="relative z-20 pt-16 px-6 text-center">
              <h2 class="text-2xl font-bold text-white drop-shadow-lg mb-2 flex items-center justify-center gap-2">
                <Icon name="mingcute:voice-fill" class="text-primary" />
                {{ roomInfo.title || t('detail.voice_room') }}
              </h2>
              <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                ID: {{ roomInfo.roomId }}
              </div>
            </div>

            <div class="relative z-20 flex-1 min-h-0">
              <SeatGrid :room-info="roomInfo" />
            </div>
          </div>
        </template>

        <template #fallback>
          <div class="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-gray-950 text-white">
            <div class="flex flex-col items-center gap-4">
              <span class="loading loading-spinner loading-lg text-primary"></span>
              <span class="text-sm font-medium text-white/50 animate-pulse">{{ t('detail.loading_stream') }}</span>
            </div>
          </div>
        </template>
      </ClientOnly>

      <div class="absolute left-4 top-4 z-50">
        <button
          class="btn btn-circle btn-sm bg-black/20 border-white/10 text-white backdrop-blur-md hover:bg-black/40 hover:scale-105 transition-all"
          @click="handleBack">
          <Icon name="mingcute:left-line" class="text-xl" />
        </button>
      </div>
    </div>

    <div
      class="relative z-30 flex flex-1 lg:flex-none lg:w-[400px] flex-col bg-base-100 shadow-2xl border-l border-base-content/5 overflow-hidden h-[55vh] lg:h-full">

      <div v-if="pending" class="flex flex-1 flex-col p-4 gap-4 animate-pulse">
        <div class="flex items-center gap-3 border-b border-base-content/5 pb-4">
          <div class="w-12 h-12 rounded-full bg-base-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-32 bg-base-200 rounded"></div>
            <div class="h-3 w-20 bg-base-200 rounded"></div>
          </div>
        </div>
        <div class="flex-1 bg-base-200/30 rounded-xl"></div>
      </div>

      <template v-else-if="roomInfo">
        <div
          class="flex-none flex items-center justify-between border-b border-base-content/5 bg-base-100/95 p-3 lg:p-4 backdrop-blur-md z-10 shadow-sm">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="avatar">
              <div
                class="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100 shadow-sm cursor-pointer hover:scale-105 transition-transform bg-base-300">
                <img :src="getAvatarUrl(roomInfo.ownerAvatar, roomInfo.ownerId)"
                  class="object-cover w-full h-full rounded-full" alt="anchor" />
              </div>
            </div>
            <div class="flex flex-col truncate">
              <span class="font-bold text-base-content truncate text-sm sm:text-base">{{ roomInfo.ownerNickname
                }}</span>
              <div class="flex items-center gap-1.5 text-xs text-base-content/60">
                <div class="flex items-center gap-0.5 text-error">
                  <Icon name="mingcute:fire-fill" />
                  <span class="font-mono">{{ formatChineseNumber(roomInfo.memberCount) }}</span>
                </div>
                <span class="w-px h-3 bg-base-content/20"></span>
                <span>{{ t('detail.watching') }}</span>
              </div>
            </div>
          </div>
          <button
            class="btn btn-primary btn-sm rounded-full px-4 sm:px-5 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            @click="handleFollow">
            <Icon name="mingcute:add-line" />
            <span class="hidden sm:inline">{{ t('detail.follow') }}</span>
          </button>
        </div>

        <div class="flex-1 min-h-0 flex flex-col relative bg-base-50/50 overflow-hidden">
          <ClientOnly>
            <LiveChatList :owner-id="roomInfo.ownerId" class="flex-1 min-h-0" />
          </ClientOnly>
        </div>

        <div class="flex-none border-t border-base-content/5 bg-base-100 p-3 lg:p-4 pb-safe z-10">
          <div class="flex gap-2 items-center relative">
            <div class="relative flex-1 group transition-all duration-300 focus-within:scale-[1.01]">
              <input v-model="textContent" type="text" :placeholder="t('detail.say_something')"
                class="input input-bordered w-full rounded-full bg-base-200/50 pl-4 pr-12 focus:outline-none focus:bg-base-100 focus:border-primary transition-all text-sm h-10"
                :disabled="isSending" @keydown.enter="handleSend" />
              <span v-if="textContent.length > 0"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-base-content/40 font-mono">
                {{ textContent.length }}
              </span>
            </div>

            <button
              class="btn btn-circle btn-primary shadow-lg shadow-primary/30 transition-transform active:scale-95 disabled:bg-base-200 disabled:text-base-content/20 disabled:shadow-none h-10 w-10 min-h-0"
              :disabled="!textContent.trim() || isSending" @click="handleSend">
              <span v-if="isSending" class="loading loading-spinner loading-xs"></span>
              <Icon v-else name="mingcute:send-plane-fill" class="text-lg translate-x-0.5 -translate-y-0.5" />
            </button>
          </div>
        </div>
      </template>

      <div v-else class="flex h-full flex-col items-center justify-center gap-6 text-base-content/60 p-8">
        <Icon name="mingcute:ghost-line" class="text-8xl opacity-80" />
        <div class="text-center space-y-2">
          <h3 class="text-xl font-bold">{{ t('detail.not_found') }}</h3>
          <p class="text-sm opacity-70">{{ t('detail.not_found_desc') }}</p>
        </div>
        <button class="btn btn-outline btn-wide" @click="handleBack">
          {{ t('detail.back') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import * as LiveApi from '~/api/live'
import type { LiveRoom } from '~/api/live'
import { useBarrageState } from 'tuikit-atomicx-vue3'
definePageMeta({ layout: 'empty' })

const LivePlayer = defineAsyncComponent(() => import('~/components/live/Player.vue'))
const LiveChatList = defineAsyncComponent(() => import('~/components/live/ChatList.vue'))
const SeatGrid = defineAsyncComponent(() => import('~/components/live/SeatGrid.vue'))

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const dialog = useDialog()
const toast = useToast()

const roomId = computed(() => route.params.id as string)
const loading = ref(true)
const textContent = ref('')
const isSending = ref(false)

const { sendTextMessage } = useBarrageState()

const { data: roomInfo, pending, error } = await useAsyncData<LiveRoom>(
  `room-${roomId.value}`,
  () => LiveApi.info(roomId.value).then(res => res.data),
  { watch: [roomId] }
)

const isVoiceRoom = computed(() => roomInfo.value?.roomType === 'voiceroom')

const getAvatarUrl = (url?: string, seed?: string) => {
  if (url && url.startsWith('http')) return url
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed || 'default'}`
}

const handleBack = async () => {
  const confirmed = await dialog.confirm({
    title: t('detail.exit_title'),
    content: t('detail.exit_content'),
    type: 'warning',
    confirmText: t('detail.confirm_exit'),
    cancelText: t('detail.cancel')
  })
  if (confirmed) router.push('/live')
}

const handleFollow = async () => {
  const confirmed = await dialog.confirm({
    title: t('detail.download_title'),
    content: t('detail.download_desc'),
    type: 'info',
    confirmText: t('detail.download_btn'),
    cancelText: t('detail.cancel_btn'),
  })
  if (confirmed) window.open('https://blog.lifetv.chat/apps', '_blank')
}

const handleSend = async () => {
  const text = textContent.value.trim()
  if (!text) return

  isSending.value = true
  try {
    await sendTextMessage({ text })
    textContent.value = ''
  } catch (error: any) {
    if (error.code === 10017) {
      toast.error(t('detail.mute_error'))
    } else {
      toast.error(t('detail.send_error'))
    }
  } finally {
    isSending.value = false
  }
}

if (error.value) console.error('Room Fetch Error:', error.value)

useHead({
  title: computed(() => roomInfo.value?.title || t('detail.live_room')),
})
</script>
<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

@keyframes music-bar {

  0%,
  100% {
    height: 20%;
  }

  50% {
    height: 100%;
  }
}
</style>
<i18n lang="json">{
  "zh-CN": {
    "detail": {
      "live_room": "直播间",
      "voice_room": "语音聊天室",
      "watching": "在线",
      "follow": "关注",
      "on_air": "正在直播",
      "loading_stream": "正在连接信号...",
      "say_something": "聊点什么...",
      "not_found": "房间不存在",
      "not_found_desc": "主播可能已经下播，去看看其他房间吧",
      "back": "返回大厅",
      "exit_title": "退出房间",
      "exit_content": "确定要离开当前房间吗？",
      "confirm_exit": "离开",
      "cancel": "取消",
      "download_title": "下载 APP",
      "download_desc": "下载 APP 即可关注主播、送礼、开播，体验完整功能！",
      "download_btn": "去下载",
      "cancel_btn": "再看看",
      "send_error": "发送失败，请重试",
      "mute_error": "您已被禁言",
      "notice": "系统公告",
      "welcome": "欢迎来到直播间，请遵守社区规范，文明发言。",
      "guest": "游客",
      "anchor": "主播",
      "unknown_msg": "[未知消息类型]"
    }
  },
  "zh-TW": {
    "detail": {
      "live_room": "直播間",
      "voice_room": "語音聊天室",
      "watching": "在線",
      "follow": "關注",
      "on_air": "正在直播",
      "loading_stream": "正在連接信號...",
      "say_something": "聊點什麼...",
      "not_found": "房間不存在",
      "not_found_desc": "主播可能已經下播，去看看其他房間吧",
      "back": "返回大廳",
      "exit_title": "退出房間",
      "exit_content": "確定要離開當前房間嗎？",
      "confirm_exit": "離開",
      "cancel": "取消",
      "download_title": "下載 APP",
      "download_desc": "下載 APP 即可關注主播、送禮、開播，體驗完整功能！",
      "download_btn": "去下載",
      "cancel_btn": "再看看",
      "send_error": "發送失敗，請重試",
      "mute_error": "您已被禁言",
      "notice": "系統公告",
      "welcome": "歡迎來到直播間，請遵守社區規範，文明發言。",
      "guest": "遊客",
      "anchor": "主播",
      "unknown_msg": "[未知消息類型]"
    }
  },
  "en": {
    "detail": {
      "live_room": "Live Room",
      "voice_room": "Voice Room",
      "watching": "Online",
      "follow": "Follow",
      "on_air": "On Air",
      "loading_stream": "Connecting...",
      "say_something": "Say something...",
      "not_found": "Room Not Found",
      "not_found_desc": "Streamer might be offline.",
      "back": "Back",
      "exit_title": "Leave Room",
      "exit_content": "Are you sure you want to leave?",
      "confirm_exit": "Leave",
      "cancel": "Cancel",
      "download_title": "Download App",
      "download_desc": "Download App to follow, send gifts and go live!",
      "download_btn": "Download",
      "cancel_btn": "Later",
      "send_error": "Failed to send",
      "mute_error": "You are muted",
      "notice": "System Notice",
      "welcome": "Welcome to the live room. Please follow community guidelines.",
      "guest": "Guest",
      "anchor": "Host",
      "unknown_msg": "[Unknown Message]"
    }
  }
}</i18n>