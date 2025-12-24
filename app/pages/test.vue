<template>
  <div>
    <button @click="test" class="btn btn-primary">test</button>
  </div>
</template>

<script lang="ts" setup>
import TencentCloudChat, { ChatSDK } from '@tencentcloud/lite-chat';
let chatSdk: ChatSDK | null = null;
async function test() {


}

onMounted(() => {
  chatSdk = TencentCloudChat.create({
    SDKAppID: 1600113800,
  })
  chatSdk.on(TencentCloudChat.EVENT.SDK_READY, () => {
    console.log("ready!!");

  })
})
</script>
