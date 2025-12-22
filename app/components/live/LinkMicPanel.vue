<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="visible" class="fixed inset-0 z-[100]" @click.self="emit('close')">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')"></div>
        
        <div class="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-3xl shadow-2xl max-h-[50vh] flex flex-col overflow-hidden pb-safe">
          <div class="flex items-center justify-between p-4 border-b border-base-content/5">
            <div class="flex items-center gap-2">
              <Icon name="mingcute:mic-fill" class="text-xl text-primary" />
              <span class="font-bold text-base-content">{{ t('linkmic.title') }}</span>
            </div>
            <button class="btn btn-circle btn-ghost btn-sm" @click="emit('close')">
              <Icon name="mingcute:close-line" class="text-lg" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="linkStatus === 'none'" class="space-y-4">
              <div class="text-center py-6">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="mingcute:voice-fill" class="text-4xl text-primary" />
                </div>
                <h3 class="text-lg font-bold text-base-content mb-2">{{ t('linkmic.join_voice') }}</h3>
                <p class="text-sm text-base-content/60">{{ t('linkmic.join_desc') }}</p>
              </div>

              <div class="bg-warning/10 border border-warning/20 rounded-xl p-3 text-sm text-warning">
                <div class="flex items-start gap-2">
                  <Icon name="mingcute:warning-fill" class="text-lg flex-shrink-0 mt-0.5" />
                  <span>{{ t('linkmic.permission_tip') }}</span>
                </div>
              </div>
            </div>

            <div v-else-if="linkStatus === 'applying'" class="text-center py-8">
              <span class="loading loading-spinner loading-lg text-primary"></span>
              <p class="mt-4 text-base-content/70">{{ t('linkmic.waiting') }}</p>
              <p class="text-sm text-base-content/50 mt-1">{{ t('linkmic.timeout_tip') }}</p>
            </div>

            <div v-else-if="linkStatus === 'linking'" class="text-center py-6">
              <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                <Icon name="mingcute:check-circle-fill" class="text-4xl text-success" />
              </div>
              <h3 class="text-lg font-bold text-success mb-2">{{ t('linkmic.on_mic') }}</h3>
              <p class="text-sm text-base-content/60">{{ t('linkmic.on_mic_desc') }}</p>
            </div>
          </div>

          <div class="flex-none p-4 border-t border-base-content/5 bg-base-100">
            <button
              v-if="linkStatus === 'none'"
              class="btn btn-primary w-full gap-2"
              :disabled="applying"
              @click="handleApply"
            >
              <span v-if="applying" class="loading loading-spinner loading-sm"></span>
              <template v-else>
                <Icon name="mingcute:mic-fill" />
                {{ t('linkmic.apply_btn') }}
              </template>
            </button>

            <button
              v-else-if="linkStatus === 'applying'"
              class="btn btn-outline btn-error w-full gap-2"
              :disabled="cancelling"
              @click="handleCancel"
            >
              <span v-if="cancelling" class="loading loading-spinner loading-sm"></span>
              <template v-else>
                <Icon name="mingcute:close-line" />
                {{ t('linkmic.cancel_btn') }}
              </template>
            </button>

            <button
              v-else-if="linkStatus === 'linking'"
              class="btn btn-outline btn-error w-full gap-2"
              :disabled="leaving"
              @click="handleLeave"
            >
              <span v-if="leaving" class="loading loading-spinner loading-sm"></span>
              <template v-else>
                <Icon name="mingcute:exit-line" />
                {{ t('linkmic.leave_btn') }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import * as LinkMicApi from '~/api/linkmic'
import { LinkStatus } from '~/api/linkmic'

const props = defineProps<{
  visible: boolean
  roomId: string
  linkStatus: LinkStatus
}>()

const emit = defineEmits<{
  close: []
  statusChange: [status: LinkStatus]
}>()

const { t } = useI18n()
const toast = useToast()

const applying = ref(false)
const cancelling = ref(false)
const leaving = ref(false)

const APPLY_TIMEOUT = 60000

let timeoutTimer: ReturnType<typeof setTimeout> | null = null

const handleApply = async () => {
  applying.value = true
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
  } catch (e: any) {
    applying.value = false
    if (e.name === 'NotAllowedError') {
      toast.error(t('linkmic.permission_denied'))
    } else {
      toast.error(t('linkmic.device_error'))
    }
    return
  }

  try {
    const userId = localStorage.getItem('userId') || 'guest_' + Date.now()
    const userName = localStorage.getItem('userName') || t('linkmic.guest')
    const userAvatar = localStorage.getItem('userAvatar') || ''

    await LinkMicApi.applyToTakeSeat({
      roomId: props.roomId,
      userId,
      userName,
      avatarUrl: userAvatar,
      seatIndex: -1,
      timeout: 60
    })

    emit('statusChange', LinkStatus.APPLYING)
    toast.success(t('linkmic.apply_success'))

    timeoutTimer = setTimeout(() => {
      if (props.linkStatus === LinkStatus.APPLYING) {
        emit('statusChange', LinkStatus.NONE)
        toast.error(t('linkmic.apply_timeout'))
      }
    }, APPLY_TIMEOUT)

  } catch (e) {
    toast.error(t('linkmic.apply_failed'))
  } finally {
    applying.value = false
  }
}

const handleCancel = async () => {
  cancelling.value = true
  try {
    const userId = localStorage.getItem('userId') || ''
    await LinkMicApi.cancelApplication(props.roomId, userId)
    emit('statusChange', LinkStatus.NONE)
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
      timeoutTimer = null
    }
    toast.success(t('linkmic.cancel_success'))
  } catch (e) {
    toast.error(t('linkmic.cancel_failed'))
  } finally {
    cancelling.value = false
  }
}

const handleLeave = async () => {
  leaving.value = true
  try {
    const userId = localStorage.getItem('userId') || ''
    await LinkMicApi.leaveSeat(props.roomId, userId)
    emit('statusChange', LinkStatus.NONE)
    toast.success(t('linkmic.leave_success'))
  } catch (e) {
    toast.error(t('linkmic.leave_failed'))
  } finally {
    leaving.value = false
  }
}

onUnmounted(() => {
  if (timeoutTimer) {
    clearTimeout(timeoutTimer)
  }
})
</script>

<style scoped>
.pb-safe {
  padding-bottom: max(env(safe-area-inset-bottom, 16px), 16px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-active > div:last-child,
.slide-up-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from > div:last-child,
.slide-up-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>

<i18n lang="json">{
  "zh-CN": {
    "linkmic": {
      "title": "语音连麦",
      "join_voice": "加入语音互动",
      "join_desc": "申请上麦后，您可以与主播和其他用户实时语音交流",
      "permission_tip": "上麦需要麦克风权限，请在弹出提示时允许访问",
      "waiting": "等待主播同意...",
      "timeout_tip": "申请将在60秒后自动取消",
      "on_mic": "您已上麦",
      "on_mic_desc": "您现在可以与房间内的人语音交流",
      "apply_btn": "申请上麦",
      "cancel_btn": "取消申请",
      "leave_btn": "下麦",
      "apply_success": "申请已发送",
      "apply_failed": "申请失败，请重试",
      "apply_timeout": "申请超时，请重试",
      "cancel_success": "已取消申请",
      "cancel_failed": "取消失败",
      "leave_success": "已下麦",
      "leave_failed": "下麦失败",
      "permission_denied": "请允许麦克风权限",
      "device_error": "无法访问麦克风",
      "guest": "游客"
    }
  },
  "zh-TW": {
    "linkmic": {
      "title": "語音連麥",
      "join_voice": "加入語音互動",
      "join_desc": "申請上麥後，您可以與主播和其他用戶實時語音交流",
      "permission_tip": "上麥需要麥克風權限，請在彈出提示時允許訪問",
      "waiting": "等待主播同意...",
      "timeout_tip": "申請將在60秒後自動取消",
      "on_mic": "您已上麥",
      "on_mic_desc": "您現在可以與房間內的人語音交流",
      "apply_btn": "申請上麥",
      "cancel_btn": "取消申請",
      "leave_btn": "下麥",
      "apply_success": "申請已發送",
      "apply_failed": "申請失敗，請重試",
      "apply_timeout": "申請超時，請重試",
      "cancel_success": "已取消申請",
      "cancel_failed": "取消失敗",
      "leave_success": "已下麥",
      "leave_failed": "下麥失敗",
      "permission_denied": "請允許麥克風權限",
      "device_error": "無法訪問麥克風",
      "guest": "遊客"
    }
  },
  "en": {
    "linkmic": {
      "title": "Voice Chat",
      "join_voice": "Join Voice Chat",
      "join_desc": "After approval, you can voice chat with the host and other users",
      "permission_tip": "Microphone permission is required. Please allow access when prompted",
      "waiting": "Waiting for host approval...",
      "timeout_tip": "Request will auto-cancel in 60 seconds",
      "on_mic": "You're On Mic",
      "on_mic_desc": "You can now voice chat with others in the room",
      "apply_btn": "Request to Speak",
      "cancel_btn": "Cancel Request",
      "leave_btn": "Leave Mic",
      "apply_success": "Request sent",
      "apply_failed": "Request failed, please retry",
      "apply_timeout": "Request timed out",
      "cancel_success": "Request cancelled",
      "cancel_failed": "Failed to cancel",
      "leave_success": "Left the mic",
      "leave_failed": "Failed to leave",
      "permission_denied": "Please allow microphone access",
      "device_error": "Cannot access microphone",
      "guest": "Guest"
    }
  }
}</i18n>
