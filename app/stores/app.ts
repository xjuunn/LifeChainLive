import { defineStore } from 'pinia'
import TencentCloudChat, { type ChatSDK } from '@tencentcloud/lite-chat'
import * as LiveApi from '~/api/live'

interface AuthState {
  sdkAppId: number | null
  userId: string | null
  userSig: string | null
}

export const useAppStore = defineStore('app', () => {
  const auth = ref<AuthState>({
    sdkAppId: 1600113800,
    userId: null,
    userSig: null,
  })

  const chatSdk = shallowRef<ChatSDK | null>(null)
  const isChatReady = ref(false)

  const ensureUserId = (): string => {
    if (auth.value.userId) return auth.value.userId
    const guestId = `guest_${Math.floor(Math.random() * 10000000)}`
    auth.value.userId = guestId
    return guestId
  }

  const ensureChatSdk = (): ChatSDK => {
    if (chatSdk.value) return chatSdk.value

    const sdk = TencentCloudChat.create({
      SDKAppID: auth.value.sdkAppId!
    })

    sdk.on(TencentCloudChat.EVENT.SDK_READY, () => {
      isChatReady.value = true
      console.log('=== [IM] SDK READY ===')
    })

    sdk.on(TencentCloudChat.EVENT.SDK_NOT_READY, () => {
      isChatReady.value = false
    })

    chatSdk.value = sdk
    return sdk
  }

  const loginChat = async (userId: string, userSig: string) => {
    const sdk = ensureChatSdk()
    try {
      await sdk.login({
        userID: userId,
        userSig: userSig
      })
      auth.value.userId = userId
      auth.value.userSig = userSig
    } catch (error) {
      console.error('[IM] Login Failed', error)
      throw error
    }
  }

  const initAndLogin = async (roomId: string) => {
    const { userId, userSig } = await getLivePermission(roomId)
    if (!(userId && userSig)) throw new Error("登录失败")
    await loginChat(userId, userSig)
  }

  const getLivePermission = async (roomId: string) => {
    const userId = ensureUserId()
    const res = await LiveApi.join(userId, roomId)
    const data = res.data || res

    if (!data.sdkAppId || !data.userSig) throw new Error('AUTH_FAILED')

    auth.value = {
      sdkAppId: Number(data.sdkAppId),
      userId: String(data.userId || userId),
      userSig: String(data.userSig),
    }

    return {
      sdkAppId: auth.value.sdkAppId,
      userId: auth.value.userId,
      userSig: auth.value.userSig,
      roomId: String(data.roomId || roomId)
    }
  }

  return {
    auth,
    chatSdk,
    isChatReady,
    getLivePermission,
    ensureChatSdk,
    loginChat,
    initAndLogin
  }
}, {
  persist: true
})