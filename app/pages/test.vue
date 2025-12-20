<template>
  <div>
    <button @click="test" class="btn btn-primary">test</button>
  </div>
</template>

<script lang="ts" setup>
async function test() {
  const data = await useSocket().request('live:list', {
    page: 1,
    pageSize: 10
  })
  console.log(data);

}

onMounted(() => {
  useSocketEvent('live:room:created', (room) => {
    console.log('create:', room);
  })
  useSocketEvent('live:room:ended', (data) => {
    console.log('close', data);
  })
  console.log("初始化监听");

})
</script>
