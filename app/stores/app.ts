// stores/app.ts
import { defineStore } from 'pinia'
import * as LiveApi from '~/api/live'

interface AuthState {
  sdkAppId: number | null
  userId: string | null
  userSig: string | null
}

export const useAppStore = defineStore('app', () => {
  const auth = ref<AuthState>({
    sdkAppId: null,
    userId: null,
    userSig: null,
  })

  const isReady = computed(() => !!(auth.value.userId && auth.value.userSig))

  /**
   * 获取或初始化持久化的 Guest ID
   */
  const ensureUserId = () => {
    if (auth.value.userId) return auth.value.userId
    const guestId = `guest_${Math.floor(Math.random() * 10000000)}`
    auth.value.userId = guestId
    return guestId
  }

  /**
   * 获取直播间准入凭证
   */
  const getLivePermission = async (roomId: string) => {
    const userId = ensureUserId()
    const res = await LiveApi.join(userId, roomId)
    const data = res.data || res

    if (!data.sdkAppId || !data.userSig) {
      throw new Error('AUTH_FAILED')
    }

    auth.value = {
      sdkAppId: Number(data.sdkAppId),
      userId: String(data.userId || userId),
      userSig: String(data.userSig),
    }

    return { ...auth.value, roomId: data.roomId || roomId }
  }

  const clearAuth = () => {
    auth.value = { sdkAppId: null, userId: null, userSig: null }
  }

  return {
    auth,
    isReady,
    getLivePermission,
    clearAuth
  }
}, {
  persist: true
})