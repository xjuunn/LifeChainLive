<template>
  <div class="min-h-screen bg-black text-white flex flex-col items-center justify-center">

    <!-- 输入房间号准备观看 -->
    <div v-if="!isPlaying" class="w-full max-w-md p-6 space-y-6 bg-gray-900/80 rounded-xl backdrop-blur">
      <h2 class="text-2xl font-bold text-center">游客直播体验
      </h2>

      <div class="flex gap-2">
        <input v-model="roomId" type="text" placeholder="请输入直播间 ID"
          class="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          @keyup.enter="handleGuestWatch" />
        <button @click="handleGuestWatch" :disabled="isLoading || !roomId"
          class="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center min-w-[100px]">
          <span v-if="isLoading" class="i-heroicons-arrow-path-20-solid animate-spin"></span>
          <span v-else>观看</span>
        </button>
      </div>
    </div>

    <!-- 直播观看界面 -->
    <ClientOnly>
      <div v-if="isPlaying" class="relative w-full h-screen bg-black">
        <LiveView class="w-full h-full" style="object-fit: contain;" />
        <button @click="handleExit"
          class="absolute top-6 right-6 z-50 p-2 bg-black/40 rounded-full hover:bg-black/60 backdrop-blur transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from 'vue';
import * as LiveApi from '~/api/live';
import { LiveView, useLoginState, useLiveListState } from 'tuikit-atomicx-vue3';
const { login } = useLoginState();
const { joinLive, leaveLive } = useLiveListState();

const roomId = ref('');
const isPlaying = ref(false);
const isLoading = ref(false);

const handleGuestWatch = async () => {
  if (!roomId.value) return;
  isLoading.value = true;

  try {
    const guestId = `guest_${Math.floor(Math.random() * 10000000)}`;
    const response = await LiveApi.join(guestId, roomId.value);
    const authInfo = response.data || response;
    if (!authInfo.sdkAppId || !authInfo.userSig) {
      throw new Error('鉴权信息缺失，请检查后端返回结构');
    }
    await login({
      sdkAppId: Number(authInfo.sdkAppId),
      userId: String(authInfo.userId),
      userSig: String(authInfo.userSig)
    });
    await joinLive({ liveId: String(authInfo.roomId) });
    isPlaying.value = true;
  } catch (error: any) {
    console.error('观看失败:', error);
    alert(`无法观看: ${error.message || '连接失败'}`);
  } finally {
    isLoading.value = false;
  }
};

const handleExit = async () => {
  try {
    await leaveLive();
  } catch (e) {
    console.warn(e);
  } finally {
    isPlaying.value = false;
    window.location.reload();
  }
};

onUnmounted(() => {
  if (isPlaying.value) leaveLive().catch(() => { });
});
</script>

<style scoped>
body {
  overflow: hidden;
}
</style>