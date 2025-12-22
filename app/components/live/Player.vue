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
import { LiveView, useLoginState, useLiveListState } from 'tuikit-atomicx-vue3'
import * as LiveApi from '~/api/live'

const props = defineProps<{ roomId: string }>()
const emit = defineEmits(['loaded'])
const { t } = useI18n()
const toast = useToast()

const { login } = useLoginState()
const { joinLive, leaveLive } = useLiveListState()

const initError = ref('')
let isJoined = false

const initLive = async () => {
  initError.value = ''
  try {
    // 使用固定的用户ID，确保SDK和应用使用同一个ID
    let guestId = localStorage.getItem('userId')
    if (!guestId) {
      guestId = `guest_${Math.floor(Math.random() * 10000000)}`
      localStorage.setItem('userId', guestId)
    }
    
    const res = await LiveApi.join(guestId, props.roomId)
    const auth = res.data || res

    if (!auth.sdkAppId || !auth.userSig) {
      throw new Error(t('player.auth_failed'))
    }

    console.log('SDK登录, userId:', auth.userId, 'roomId:', auth.roomId)
    
    await login({
      sdkAppId: Number(auth.sdkAppId),
      userId: String(auth.userId),
      userSig: String(auth.userSig)
    })

    await joinLive({ liveId: String(auth.roomId) })
    isJoined = true
    emit('loaded')

  } catch (e: any) {
    console.error('Live Init Failed:', e)
    initError.value = e.message || t('player.join_failed')
    toast.error(initError.value)
  }
}

onMounted(() => {
  initLive()
})

onUnmounted(() => {
  if (isJoined) {
    leaveLive().catch(console.warn)
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