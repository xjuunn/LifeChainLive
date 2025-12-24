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

const props = defineProps<{ roomId: string }>()
const emit = defineEmits(['loaded'])
const { t } = useI18n()
const toast = useToast()

const appStore = useAppStore()
const { login } = useLoginState()
const { joinLive, leaveLive } = useLiveListState()

const initError = ref('')
let isJoined = false

const initLive = async () => {
  initError.value = ''
  try {
    const { sdkAppId, userId, userSig, roomId } = await appStore.getLivePermission(props.roomId)

    if (sdkAppId && userId && userSig)
      await login({
        sdkAppId,
        userId,
        userSig
      })

    await joinLive({ liveId: String(roomId) })

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
  if (isJoined) {
    leaveLive().catch(console.warn)
  }
})
</script>