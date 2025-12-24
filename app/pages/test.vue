<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-6">
      <div :class="['badge p-4', appStore.isChatReady ? 'badge-success' : 'badge-error']">
        IM Status: {{ appStore.isChatReady ? 'READY' : 'NOT READY' }}
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <button class="btn btn-primary" :disabled="loading" @click="handleManualTest">
        <span v-if="loading" class="loading loading-spinner"></span>
        Manual Login & Test
      </button>

      <p class="text-xs opacity-50">SDK ID: {{ appStore.auth.sdkAppId }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const loading = ref(false)

async function handleManualTest() {
  loading.value = true
  try {
    await appStore.initAndLogin('1001')
    const sdk = appStore.ensureChatSdk()
    console.log('当前用户信息:', await sdk.getMyProfile())
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  appStore.ensureChatSdk()
  if (appStore.auth.userId) {
    console.log('等待登录...')
  }
})
</script>