import { defineStore } from 'pinia'
import TencentCloudChat, { type ChatSDK } from '@tencentcloud/lite-chat'
import { useLiveListState, useLoginState } from 'tuikit-atomicx-vue3'
import * as LiveApi from '~/api/live'

interface AuthState {
  sdkAppId: number
  userId: string | null
  userSig: string | null
}

export const useAppStore = defineStore('app', () => {
  const auth = ref<AuthState>({
    sdkAppId: 1600113800,
    userId: null,
    userSig: null,
  })

  const chatSdk = shallowRef<ChatSDK>(TencentCloudChat.create({
    SDKAppID: auth.value.sdkAppId,
  }))

  const ensureUserId = (): string => {
    if (auth.value.userId) return auth.value.userId
    const guestId = `guest_${Math.floor(Math.random() * 10000000)}`
    auth.value.userId = guestId
    return guestId
  }

  async function join(roomId: string) {
    const { login } = useLoginState()
    const { joinLive } = useLiveListState()

    const userId = ensureUserId()
    const result = await LiveApi.join(userId, roomId)
    const data = result.data || result

    auth.value.userId = String(data.userId || userId)
    auth.value.userSig = data.userSig

    await login({
      sdkAppId: auth.value.sdkAppId,
      userId: auth.value.userId!,
      userSig: auth.value.userSig!
    })

    await joinLive({ liveId: roomId })
    return data
  }

  function bindMessageListener(callback: (event: any) => void) {
    chatSdk.value.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, callback)
  }

  function unbindMessageListener(callback: (event: any) => void) {
    chatSdk.value.off(TencentCloudChat.EVENT.MESSAGE_RECEIVED, callback)
  }

  return {
    auth,
    join,
    chatSdk,
    bindMessageListener,
    unbindMessageListener
  }
}, { persist: true })