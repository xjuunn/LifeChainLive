<template>
  <div>
    <button @click="test" class="btn btn-primary">test</button>
  </div>
</template>

<script lang="ts" setup>
import * as LifeApi from '~/api/live'
async function test() {
  const result = await LifeApi.list();
  console.log(result);

}
</script>
