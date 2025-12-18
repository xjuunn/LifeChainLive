<template>
  <div class="flex h-[100dvh] w-full flex-col bg-black lg:flex-row overflow-hidden font-sans">
    <!-- 左侧/顶部：直播播放器区域 -->
    <div class="relative flex-1 overflow-hidden bg-black group/player">
      <div class="absolute inset-0 z-0">
        <ClientOnly>
          <LivePlayer v-if="roomInfo" :room-id="roomId" @loaded="loading = false" />
          <template #fallback>
            <div class="flex h-full w-full items-center justify-center bg-gray-950 text-white">
              <div class="flex flex-col items-center gap-4">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <span class="text-sm font-medium text-white/50 animate-pulse">{{ t('detail.loading_stream') }}</span>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- 顶部浮层：移动端返回按钮 -->
      <div
        class="absolute left-0 top-0 z-20 w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 sm:opacity-0 sm:group-hover/player:opacity-100">
        <button
          class="btn btn-circle btn-sm bg-white/10 border-white/5 text-white backdrop-blur-md hover:bg-white/20 hover:scale-105 transition-all"
          @click="handleBack">
          <Icon name="mingcute:left-line" class="text-xl" />
        </button>
      </div>
    </div>

    <!-- 右侧/底部：互动区域 -->
    <div
      class="relative z-20 flex h-[40vh] w-full flex-col bg-base-100 shadow-2xl transition-all lg:h-full lg:w-[400px] border-l border-base-content/5">

      <!-- 加载中骨架屏 -->
      <div v-if="pending" class="flex flex-1 flex-col p-4 gap-4 animate-pulse">
        <div class="flex items-center gap-3 border-b border-base-content/5 pb-4">
          <div class="w-10 h-10 rounded-full bg-base-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-24 bg-base-200 rounded"></div>
            <div class="h-3 w-16 bg-base-200 rounded"></div>
          </div>
        </div>
        <div class="flex-1 bg-base-200/30 rounded-xl"></div>
        <div class="h-12 bg-base-200 rounded-full"></div>
      </div>

      <template v-else-if="roomInfo">
        <!-- 主播信息栏 -->
        <div
          class="flex items-center justify-between border-b border-base-content/5 bg-base-100/80 p-3 lg:p-4 backdrop-blur-md z-10">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="avatar">
              <div
                class="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <!-- 修复头像显示 -->
                <img :src="getAvatarUrl(roomInfo.ownerAvatar, roomInfo.ownerId)"
                  class="object-cover w-full h-full rounded-full" alt="anchor" />
              </div>
            </div>
            <div class="flex flex-col truncate">
              <span class="font-bold text-base-content truncate text-sm sm:text-base">{{ roomInfo.ownerNickname
                }}</span>
              <div class="flex items-center gap-1 text-xs text-base-content/60">
                <Icon name="mingcute:fire-line" class="text-error" />
                <span>{{ formatChineseNumber(roomInfo.memberCount) }} {{ t('detail.watching') }}</span>
              </div>
            </div>
          </div>
          <button
            class="btn btn-primary btn-sm rounded-full px-4 sm:px-5 font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            @click="handleInteraction">
            <Icon name="mingcute:add-line" />
            {{ t('detail.follow') }}
          </button>
        </div>

        <!-- 弹幕列表区域 -->
        <div class="flex-1 overflow-hidden relative bg-base-50">
          <ClientOnly>
            <!-- 传入 ownerId 用于识别主播 -->
            <LiveChatList :owner-id="roomInfo.ownerId" />
            <template #fallback>
              <div class="flex h-full flex-col items-center justify-center gap-3 text-base-content/30">
                <span class="loading loading-dots loading-md"></span>
                <p class="text-xs">{{ t('detail.loading_chat') }}</p>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- 底部输入框 -->
        <div class="border-t border-base-content/5 bg-base-100 p-3 lg:p-4 pb-safe z-10">
          <div class="flex gap-2 items-center relative">
            <div class="relative flex-1 group">
              <div
                class="absolute inset-0 bg-primary/5 rounded-full scale-95 opacity-0 group-hover:opacity-100 transition-all duration-300">
              </div>
              <input type="text" readonly :placeholder="t('detail.say_something')"
                class="input input-bordered w-full rounded-full bg-base-200/50 pl-10 pr-4 focus:outline-none border-transparent hover:border-primary/20 transition-all cursor-pointer text-sm"
                @click="handleInteraction" @keydown.enter="handleInteraction" />
              <Icon name="mingcute:edit-2-line"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            </div>

            <button
              class="btn btn-circle btn-primary shadow-lg shadow-primary/30 hover:rotate-12 transition-transform active:scale-95"
              @click="handleInteraction">
              <Icon name="mingcute:send-plane-fill" class="text-lg translate-x-0.5 -translate-y-0.5" />
            </button>
          </div>
        </div>
      </template>

      <!-- 404 状态 -->
      <div v-else class="flex h-full flex-col items-center justify-center gap-6 text-base-content/60 p-8">
        <div class="relative">
          <div class="absolute inset-0 bg-base-content/5 blur-xl rounded-full"></div>
          <Icon name="mingcute:ghost-line" class="text-8xl relative opacity-80" />
        </div>
        <div class="text-center space-y-2">
          <h3 class="text-xl font-bold text-base-content">{{ t('detail.not_found') }}</h3>
          <p class="text-sm text-base-content/60">{{ t('detail.not_found_desc') }}</p>
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

// 异步组件引入
const LivePlayer = defineAsyncComponent(() => import('~/components/live/Player.vue'))
const LiveChatList = defineAsyncComponent(() => import('~/components/live/ChatList.vue'))

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const dialog = useDialog()

const roomId = computed(() => route.params.id as string)
const loading = ref(true)

// 获取房间详情
const { data: roomInfo, pending, error } = await useAsyncData<LiveRoom>(
  `room-${roomId.value}`,
  () => LiveApi.info(roomId.value).then(res => res.data),
  {
    watch: [roomId]
  }
)

// 工具：头像降级处理 (保持与 ChatList 一致)
const getAvatarUrl = (url?: string, seed?: string) => {
  if (url && url.startsWith('http')) return url
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed || 'default'}`
}

// 返回逻辑
const handleBack = async () => {
  const confirmed = await dialog.confirm({
    title: t('detail.exit_title'),
    content: t('detail.exit_content'),
    type: 'warning',
    confirmText: t('detail.confirm_exit'),
    cancelText: t('detail.cancel')
  })
  if (confirmed) {
    router.push('/live')
  }
}

// 核心交互逻辑：下载引导
const handleInteraction = async () => {
  // 弹出确认框
  const confirmed = await dialog.confirm({
    title: t('detail.download_title'),
    content: t('detail.download_desc'),
    type: 'info',
    confirmText: t('detail.download_btn'),
    cancelText: t('detail.cancel_btn'),
  })

  // 只有点击了“立即下载”(confirm) 才跳转
  if (confirmed) {
    window.open('https://blog.lifetv.chat/apps', '_blank')
  }
}

if (error.value) {
  console.error('Room Fetch Error:', error.value)
}

useHead({
  title: computed(() => roomInfo.value?.title || t('detail.live_room')),
})
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>

<i18n lang="json">{
  "zh-CN": {
    "detail": {
      "live_room": "直播间",
      "watching": "人观看",
      "follow": "关注",
      "no_title": "暂无标题",
      "welcome": "欢迎来到直播间，请遵守社区规范，文明发言。",
      "notice": "系统公告",
      "guest": "游客",
      "anchor": "主播",
      "unknown_msg": "[未知消息类型]",
      "loading_stream": "正在连接直播信号...",
      "loading_chat": "正在连接聊天室...",
      "say_something": "下载 App 参与互动...",
      "not_found": "直播间不存在或已结束",
      "not_found_desc": "主播可能已经下播，去看看其他直播吧",
      "back": "返回直播列表",
      "exit_title": "退出直播间",
      "exit_content": "确定要退出当前直播间吗？",
      "confirm_exit": "退出",
      "cancel": "取消",
      "download_title": "下载 LifeChainLive",
      "download_desc": "游客模式仅支持观看。下载 App 即可发送弹幕、送礼、关注主播，体验更多精彩内容！",
      "download_btn": "立即下载",
      "cancel_btn": "稍后再说"
    }
  },
  "zh-TW": {
    "detail": {
      "live_room": "直播間",
      "watching": "人觀看",
      "follow": "關注",
      "no_title": "暫無標題",
      "welcome": "歡迎來到直播間，請遵守社區規範，文明發言。",
      "notice": "系統公告",
      "guest": "遊客",
      "anchor": "主播",
      "unknown_msg": "[未知消息類型]",
      "loading_stream": "正在連接直播信號...",
      "loading_chat": "正在連接聊天室...",
      "say_something": "下載 App 參與互動...",
      "not_found": "直播間不存在或已結束",
      "not_found_desc": "主播可能已經下播，去看看其他直播吧",
      "back": "返回直播列表",
      "exit_title": "退出直播間",
      "exit_content": "確定要退出當前直播間嗎？",
      "confirm_exit": "退出",
      "cancel": "取消",
      "download_title": "下載 LifeChainLive",
      "download_desc": "遊客模式僅支持觀看。下載 App 即可發送彈幕、送禮、關注主播，體驗更多精彩內容！",
      "download_btn": "立即下載",
      "cancel_btn": "稍後再說"
    }
  },
  "en": {
    "detail": {
      "live_room": "Live Room",
      "watching": "watching",
      "follow": "Follow",
      "no_title": "Untitled",
      "welcome": "Welcome to the live room. Please include community guidelines.",
      "notice": "Notice",
      "guest": "Guest",
      "anchor": "Host",
      "unknown_msg": "[Unknown Message]",
      "loading_stream": "Connecting stream...",
      "loading_chat": "Connecting chat...",
      "say_something": "Download App to chat...",
      "not_found": "Room not found",
      "not_found_desc": "The streamer might be offline.",
      "back": "Back to List",
      "exit_title": "Exit Room",
      "exit_content": "Are you sure you want to leave?",
      "confirm_exit": "Exit",
      "cancel": "Cancel",
      "download_title": "Download LifeChainLive",
      "download_desc": "Guest mode is view-only. Download the App to chat, send gifts, and follow streamers!",
      "download_btn": "Download Now",
      "cancel_btn": "Later"
    }
  }
}</i18n>