<template>
  <div>
    <button class="btn btn-primary" @click="test">test</button>
  </div>
</template>
<script lang="ts" setup>
import * as LiveApi from '~/api/live';
async function test() {
  const result = await LiveApi.list();
  console.log(result);


}
</script>