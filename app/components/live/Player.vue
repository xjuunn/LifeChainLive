<template>
  <div class="relative h-full w-full bg-black">
    <LiveView class="h-full w-full object-contain" />

    <div v-if="initError"
      class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white">
      <Icon name="mingcute:wifi-off-line" class="text-4xl mb-2 text-error" />
      <p>{{ initError }}</p>
      <button class="btn btn-sm btn-outline btn-error mt-4" @click="initLive">
        {{ t('player.retry') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LiveView, useLiveListState } from 'tuikit-atomicx-vue3'
import TencentCloudChat from '@tencentcloud/lite-chat'
import { useAppStore } from '~/stores/app'

const props = defineProps<{ roomId: string }>()
const emit = defineEmits(['loaded'])
const { t } = useI18n()
const toast = useToast()

const appStore = useAppStore()
const { leaveLive } = useLiveListState()

const initError = ref('')
let isJoined = false

const handleImMessage = (event: any) => {
  const messages = event.data
  if (!messages) return

  messages.forEach((msg: any) => {
    if (msg.type === TencentCloudChat.TYPES.MSG_TEXT) {
      console.log('[Chat Message]', {
        from: msg.from,
        nick: msg.nick,
        content: msg.payload.text,
        time: new Date(msg.time * 1000).toLocaleTimeString()
      })
    } else if (msg.type === TencentCloudChat.TYPES.MSG_CUSTOM) {
      try {
        const customData = JSON.parse(msg.payload.data)
        if (customData.type === 'gift') {
          console.log('[Gift Message]', {
            sender: msg.from,
            giftName: customData.giftName,
            count: customData.count,
            desc: customData.description
          })
        }
      } catch (e) {
        console.log('[Raw Custom Message]', msg.payload.data)
      }
    }
  })
}

const initLive = async () => {
  initError.value = ''
  try {
    appStore.bindMessageListener(handleImMessage)

    await appStore.join(props.roomId)
    isJoined = true
    emit('loaded')
  } catch (e: any) {
    console.error('[Live Entry Error]:', e)
    const msg = e.message === 'AUTH_FAILED' ? t('player.auth_failed') : t('player.join_failed')
    initError.value = msg
    toast.error(msg)
  }
}

onMounted(() => {
  initLive()
})

onUnmounted(() => {
  appStore.unbindMessageListener(handleImMessage)
  if (isJoined) {
    leaveLive().catch(() => { })
  }
})
</script>

<i18n lang="json">{
  "zh-CN": {
    "player": {
      "retry": "重试",
      "auth_failed": "鉴权信息获取失败",
      "join_failed": "加入直播间失败"
    }
  },
  "zh-TW": {
    "player": {
      "retry": "重試",
      "auth_failed": "鑑權信息獲取失敗",
      "join_failed": "加入直播間失敗"
    }
  },
  "en": {
    "player": {
      "retry": "Retry",
      "auth_failed": "Authentication Failed",
      "join_failed": "Failed to join room"
    }
  }
}</i18n>