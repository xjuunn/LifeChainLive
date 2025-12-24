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
              <SeatGrid :room-info="roomInfo" :link-status="linkStatus" :is-muted="isMuted"
                @seat-action="handleSeatAction" />
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

      <ClientOnly>
        <GiftBullet ref="giftBulletRef" />
      </ClientOnly>
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
                class="w-10 h-10 rounded-full shadow-sm cursor-pointer hover:scale-105 transition-transform bg-base-300">
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
          <div class="join">
            <button class="btn btn-sm btn-ghost join-item" @click="handleShare">
              <icon name="mingcute:share-forward-fill"></icon>
            </button>
            <button class="btn btn-primary btn-sm join-item px-4 font-bold shadow-lg" @click="handleFollow">
              <Icon name="mingcute:add-line" />
              <span class="hidden sm:inline">{{ t('detail.follow') }}</span>
            </button>
          </div>
        </div>

        <div class="flex-1 min-h-0 relative bg-base-50/50">
          <ClientOnly>
            <LiveChatList :owner-id="roomInfo.ownerId" />
          </ClientOnly>
        </div>

        <div class="flex-none border-t border-base-content/5 bg-base-100 p-3 lg:p-4 pb-safe z-10">
          <div class="flex gap-2 items-center relative">
            <button v-if="isVoiceRoom" class="btn btn-circle btn-ghost h-10 w-10 min-h-0 hover:bg-primary/10"
              :class="linkStatusButtonClass" @click="showLinkMicPanel = true">
              <Icon name="mingcute:mic-fill" class="text-xl" />
            </button>

            <!-- <button
              class="btn btn-circle btn-ghost h-10 w-10 min-h-0 text-warning hover:bg-warning/10"
              @click="showGiftPanel = true">
              <Icon name="mingcute:gift-fill" class="text-xl" />
            </button> -->

            <div class="relative flex-1 group transition-all duration-300 focus-within:scale-[1.01]">
              <input ref="inputRef" v-model="textContent" type="text" :placeholder="t('detail.say_something')"
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

      <div v-else-if="!pending" class="flex h-full flex-col items-center justify-center gap-6 text-base-content/60 p-8">
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

    <ClientOnly>
      <!-- <GiftPanel
        v-if="roomInfo"
        :visible="showGiftPanel"
        :room-id="roomId"
        :owner-id="roomInfo.ownerId"
        :owner-name="roomInfo.ownerNickname"
        @close="showGiftPanel = false"
        @send="handleGiftSend"
      /> -->

      <GiftLuxury :show="luxuryEffect.show" :gift-icon="luxuryEffect.giftIcon" :gift-name="luxuryEffect.giftName"
        :sender-name="luxuryEffect.senderName" :gift-count="luxuryEffect.giftCount"
        @complete="luxuryEffect.show = false" />

      <LinkMicPanel v-if="roomInfo && isVoiceRoom" :visible="showLinkMicPanel" :room-id="roomId"
        :link-status="linkStatus" @close="showLinkMicPanel = false" @status-change="handleLinkStatusChange" />

      <!-- 邀请上麦弹窗 -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showInvitationDialog && pendingInvitation"
            class="fixed inset-0 z-[200] flex items-center justify-center">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="handleRejectInvitation"></div>
            <div class="relative bg-base-100 rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full animate-bounce-in">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="mingcute:mic-fill" class="text-3xl text-primary" />
                </div>
                <h3 class="text-lg font-bold text-base-content mb-2">{{ t('detail.invitation_title') }}</h3>
                <p class="text-sm text-base-content/60 mb-1">
                  <span class="font-medium text-primary">{{ pendingInvitation.hostUser?.userName || t('detail.anchor')
                  }}</span>
                  {{ t('detail.invitation_desc') }}
                </p>
                <p class="text-xs text-base-content/40 mb-6">{{ t('detail.invitation_tip') }}</p>
              </div>
              <div class="flex gap-3">
                <button class="btn btn-outline flex-1" @click="handleRejectInvitation">
                  {{ t('detail.reject') }}
                </button>
                <button class="btn btn-primary flex-1" @click="handleAcceptInvitation">
                  <Icon name="mingcute:check-fill" />
                  {{ t('detail.accept') }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import * as LiveApi from '~/api/live'
import type { LiveRoom } from '~/api/live'
import type { GiftMessage } from '~/api/gift'
import { LinkStatus } from '~/api/linkmic'
import * as LinkMicApi from '~/api/linkmic'
import { useBarrageState, useCoGuestState, GuestEvent, useLiveSeatState, useDeviceState } from 'tuikit-atomicx-vue3'
import type { SeatInfo } from 'tuikit-atomicx-vue3'

definePageMeta({ layout: 'empty' })

const LivePlayer = defineAsyncComponent(() => import('~/components/live/Player.vue'))
const LiveChatList = defineAsyncComponent(() => import('~/components/live/ChatList.vue'))
const SeatGrid = defineAsyncComponent(() => import('~/components/live/SeatGrid.vue'))
// const GiftPanel = defineAsyncComponent(() => import('~/components/live/GiftPanel.vue'))
const GiftBullet = defineAsyncComponent(() => import('~/components/live/GiftBullet.vue'))
const GiftLuxury = defineAsyncComponent(() => import('~/components/live/GiftLuxury.vue'))
const LinkMicPanel = defineAsyncComponent(() => import('~/components/live/LinkMicPanel.vue'))

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const dialog = useDialog()
const toast = useToast()

const roomId = computed(() => route.params.id as string)
const loading = ref(true)
const textContent = ref('')
const isSending = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const showGiftPanel = ref(false)
const showLinkMicPanel = ref(false)
const giftBulletRef = ref<InstanceType<typeof GiftBullet> | null>(null)
const linkStatus = ref<LinkStatus>(LinkStatus.NONE)

const luxuryEffect = reactive({
  show: false,
  giftIcon: '',
  giftName: '',
  senderName: '',
  giftCount: 0
})

const LUXURY_THRESHOLD = 500

const { sendTextMessage } = useBarrageState()
const { subscribeEvent, unsubscribeEvent, acceptInvitation, rejectInvitation, invitees } = useCoGuestState()
const { unmuteMicrophone, muteMicrophone } = useLiveSeatState()
const { openLocalMicrophone, closeLocalMicrophone } = useDeviceState()

// 麦克风状态
const isMuted = ref(true)

// 邀请上麦相关状态
const pendingInvitation = ref<{ hostUser: any; requestUserId?: string } | null>(null)
const showInvitationDialog = ref(false)

const { data: roomInfo, pending, error } = await useAsyncData<LiveRoom>(
  `room-${roomId.value}`,
  () => LiveApi.info(roomId.value).then(res => res.data),
  {
    watch: [roomId],
    lazy: true,
    server: false
  }
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

const handleShare = async () => {
  if (!roomInfo.value) return

  const url = window.location.href
  const name = roomInfo.value.ownerNickname || roomInfo.value.title || t('detail.guest')

  let shareText = ''
  if (isVoiceRoom.value) {
    shareText = `LifeChainLive · ${name} ${t('detail.share_voice_status')}\n${t('detail.share_voice_invite')}\n${url}`
  } else {
    shareText = `LifeChainLive · ${name} ${t('detail.share_live_status')}\n${t('detail.share_live_invite')}\n${url}`
  }

  try {
    await navigator.clipboard.writeText(shareText)
    toast.success(t('detail.share_success'))
  } catch (err) {
    toast.error(t('detail.share_fail'))
  }
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
    await nextTick()
    inputRef.value?.focus()
  }
}

const handleGiftSend = (message: GiftMessage) => {
  giftBulletRef.value?.addBullet(message)

  if (message.gift.price * message.giftCount >= LUXURY_THRESHOLD) {
    luxuryEffect.show = true
    luxuryEffect.giftIcon = message.gift.iconUrl
    luxuryEffect.giftName = message.gift.name
    luxuryEffect.senderName = message.sender.userName
    luxuryEffect.giftCount = message.giftCount
  }
}

const linkStatusButtonClass = computed(() => {
  switch (linkStatus.value) {
    case LinkStatus.APPLYING:
      return 'text-warning animate-pulse'
    case LinkStatus.LINKING:
      return 'text-success'
    default:
      return 'text-primary'
  }
})

const handleLinkStatusChange = (status: LinkStatus) => {
  linkStatus.value = status
}

const handleSeatAction = async (action: string, seat: SeatInfo) => {
  const userId = localStorage.getItem('userId') || 'guest_' + Date.now()
  const userName = localStorage.getItem('userName') || t('detail.guest')
  const userAvatar = localStorage.getItem('userAvatar') || ''

  switch (action) {
    case 'apply':
      showLinkMicPanel.value = true
      break
    case 'cancel':
      try {
        await LinkMicApi.cancelApplication(roomId.value, userId)
        linkStatus.value = LinkStatus.NONE
        toast.success(t('detail.cancel_success'))
      } catch (e) {
        toast.error(t('detail.cancel_failed'))
      }
      break
    case 'leave':
      try {
        await LinkMicApi.leaveSeat(roomId.value, userId)
        linkStatus.value = LinkStatus.NONE
        isMuted.value = true
        toast.success(t('detail.leave_success'))
      } catch (e) {
        toast.error(t('detail.leave_failed'))
      }
      break
    case 'toggleMic':
      try {
        console.log('切换麦克风, 当前isMuted:', isMuted.value)
        if (isMuted.value) {
          // 先打开麦克风采集，再取消静音
          console.log('调用 openLocalMicrophone...')
          await openLocalMicrophone()
          console.log('调用 unmuteMicrophone...')
          await unmuteMicrophone()
          isMuted.value = false
          console.log('麦克风已开启')
          toast.success(t('detail.mic_on'))
        } else {
          console.log('调用 muteMicrophone...')
          await muteMicrophone()
          console.log('调用 closeLocalMicrophone...')
          await closeLocalMicrophone()
          isMuted.value = true
          console.log('麦克风已关闭')
          toast.success(t('detail.mic_off'))
        }
      } catch (e) {
        console.error('切换麦克风失败:', e)
        toast.error(t('detail.mic_error'))
      }
      break
  }
}

if (error.value) console.error('Room Fetch Error:', error.value)

// 监听主播邀请上麦事件
const handleInvitationReceived = (eventInfo: { hostUser: any }) => {
  console.log('收到上麦邀请, eventInfo:', JSON.stringify(eventInfo), 'invitees:', invitees.value)
  console.log('房主ID:', roomInfo.value?.ownerId)
  pendingInvitation.value = eventInfo
  showInvitationDialog.value = true
}

const handleInvitationCancelled = () => {
  pendingInvitation.value = null
  showInvitationDialog.value = false
  toast.info(t('detail.invitation_cancelled'))
}

const handleApplicationResponded = async (eventInfo: { isAccept: boolean; hostUser: any }) => {
  if (eventInfo.isAccept) {
    linkStatus.value = LinkStatus.LINKING
    toast.success(t('detail.apply_accepted'))
    // 上麦成功后尝试开启麦克风
    try {
      console.log('尝试开启麦克风...')
      await openLocalMicrophone()
      await unmuteMicrophone()
      isMuted.value = false
      console.log('麦克风已开启')
      toast.success(t('detail.mic_on'))
    } catch (e) {
      console.error('开启麦克风失败:', e)
      isMuted.value = true  // 开麦失败保持静音状态
    }
  } else {
    linkStatus.value = LinkStatus.NONE
    toast.error(t('detail.apply_rejected'))
  }
}

const handleKickedOffSeat = () => {
  linkStatus.value = LinkStatus.NONE
  toast.info(t('detail.kicked_off'))
}

// 接受邀请
const handleAcceptInvitation = async () => {
  if (!pendingInvitation.value) return
  try {
    // SDK内部用fromUser.userId（主播ID）存储请求，所以需要使用房主ID
    const inviterId = roomInfo.value?.ownerId || pendingInvitation.value.hostUser.userId
    console.log('接受邀请, inviterId:', inviterId, 'ownerId:', roomInfo.value?.ownerId)
    await acceptInvitation({ inviterId })
    linkStatus.value = LinkStatus.LINKING
    toast.success(t('detail.invitation_accepted'))
    // 接受邀请后尝试开启麦克风
    try {
      console.log('尝试开启麦克风...')
      await openLocalMicrophone()
      await unmuteMicrophone()
      isMuted.value = false
      console.log('麦克风已开启')
      toast.success(t('detail.mic_on'))
    } catch (e) {
      console.error('开启麦克风失败:', e)
      isMuted.value = true  // 开麦失败保持静音状态
    }
  } catch (e) {
    console.error('接受邀请失败:', e)
    toast.error(t('detail.accept_failed'))
  } finally {
    showInvitationDialog.value = false
    pendingInvitation.value = null
  }
}

// 拒绝邀请
const handleRejectInvitation = async () => {
  if (!pendingInvitation.value) return
  try {
    const inviterId = roomInfo.value?.ownerId || pendingInvitation.value.hostUser.userId
    console.log('拒绝邀请, inviterId:', inviterId)
    await rejectInvitation({ inviterId })
  } catch (e) {
    console.error('拒绝邀请失败:', e)
  } finally {
    showInvitationDialog.value = false
    pendingInvitation.value = null
  }
}

onMounted(() => {
  // 订阅连麦事件
  subscribeEvent(GuestEvent.onHostInvitationReceived, handleInvitationReceived)
  subscribeEvent(GuestEvent.onHostInvitationCancelled, handleInvitationCancelled)
  subscribeEvent(GuestEvent.onGuestApplicationResponded, handleApplicationResponded)
  subscribeEvent(GuestEvent.onKickedOffSeat, handleKickedOffSeat)
})

onUnmounted(() => {
  // 取消订阅
  unsubscribeEvent(GuestEvent.onHostInvitationReceived, handleInvitationReceived)
  unsubscribeEvent(GuestEvent.onHostInvitationCancelled, handleInvitationCancelled)
  unsubscribeEvent(GuestEvent.onGuestApplicationResponded, handleApplicationResponded)
  unsubscribeEvent(GuestEvent.onKickedOffSeat, handleKickedOffSeat)
})

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
      "share_success": "分享链接已复制",
      "share_fail": "复制失败，请手动复制",
      "notice": "系统公告",
      "welcome": "欢迎来到直播间，请遵守社区规范，文明发言。",
      "guest": "游客",
      "anchor": "主播",
      "unknown_msg": "[未知消息类型]",
      "share_voice_status": "正在聊天",
      "share_voice_invite": "快来一起参与实时语音互动吧",
      "share_live_status": "正在直播",
      "share_live_invite": "快来一起参与实时视频互动吧",
      "cancel_success": "已取消申请",
      "cancel_failed": "取消失败",
      "leave_success": "已下麦",
      "leave_failed": "下麦失败",
      "invitation_title": "上麦邀请",
      "invitation_desc": "邀请您上麦互动",
      "invitation_tip": "上麦后您可以与房间内的人语音交流",
      "invitation_cancelled": "主播取消了邀请",
      "invitation_accepted": "已接受邀请，正在上麦",
      "accept_failed": "接受邀请失败",
      "apply_accepted": "申请已通过",
      "apply_rejected": "申请被拒绝",
      "kicked_off": "您已被主播下麦",
      "reject": "拒绝",
      "accept": "接受",
      "mic_on": "麦克风已开启",
      "mic_off": "麦克风已关闭",
      "mic_error": "麦克风操作失败"
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
      "share_success": "分享鏈接已復制",
      "share_fail": "復制失敗，請手動復制",
      "notice": "系統公告",
      "welcome": "歡迎來到直播間，請遵守社區規範，文明發言。",
      "guest": "遊客",
      "anchor": "主播",
      "unknown_msg": "[未知消息類型]",
      "share_voice_status": "正在聊天",
      "share_voice_invite": "快來一起參與實時語音互動吧",
      "share_live_status": "正在直播",
      "share_live_invite": "快來一起參與實時視頻互動吧",
      "cancel_success": "已取消申請",
      "cancel_failed": "取消失敗",
      "leave_success": "已下麥",
      "leave_failed": "下麥失敗",
      "invitation_title": "上麥邀請",
      "invitation_desc": "邀請您上麥互動",
      "invitation_tip": "上麥後您可以與房間內的人語音交流",
      "invitation_cancelled": "主播取消了邀請",
      "invitation_accepted": "已接受邀請，正在上麥",
      "accept_failed": "接受邀請失敗",
      "apply_accepted": "申請已通過",
      "apply_rejected": "申請被拒絕",
      "kicked_off": "您已被主播下麥",
      "reject": "拒絕",
      "accept": "接受",
      "mic_on": "麥克風已開啟",
      "mic_off": "麥克風已關閉",
      "mic_error": "麥克風操作失敗"
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
      "share_success": "Link copied to clipboard",
      "share_fail": "Failed to copy link",
      "notice": "System Notice",
      "welcome": "Welcome to the live room. Please follow community guidelines.",
      "guest": "Guest",
      "anchor": "Host",
      "unknown_msg": "[Unknown Message]",
      "share_voice_status": "is chatting",
      "share_voice_invite": "Join the real-time voice interaction",
      "share_live_status": "is live",
      "share_live_invite": "Join the real-time video interaction",
      "cancel_success": "Request cancelled",
      "cancel_failed": "Failed to cancel",
      "leave_success": "Left the mic",
      "leave_failed": "Failed to leave mic",
      "invitation_title": "Mic Invitation",
      "invitation_desc": "invites you to speak",
      "invitation_tip": "After joining, you can voice chat with others",
      "invitation_cancelled": "Host cancelled the invitation",
      "invitation_accepted": "Invitation accepted, joining mic",
      "accept_failed": "Failed to accept invitation",
      "apply_accepted": "Request approved",
      "apply_rejected": "Request rejected",
      "kicked_off": "You were removed from mic",
      "reject": "Reject",
      "accept": "Accept",
      "mic_on": "Microphone is on",
      "mic_off": "Microphone is off",
      "mic_error": "Microphone operation failed"
    }
  }
}</i18n>