<template>
  <div class="min-h-screen bg-base-200/50">
    <AppHeader />

    <main class="container mx-auto px-4 py-6">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-base-content">{{ t('list.title') }}</h1>

        <div role="tablist" class="tabs tabs-boxed bg-base-100 shadow-sm">
          <a role="tab" class="tab" :class="{ 'tab-active': !filterType }" @click="handleFilter(undefined)">
            {{ t('list.all') }}
          </a>
          <a role="tab" class="tab" :class="{ 'tab-active': filterType === 'liveroom' }"
            @click="handleFilter('liveroom')">
            {{ t('list.video') }}
          </a>
          <a role="tab" class="tab" :class="{ 'tab-active': filterType === 'voiceroom' }"
            @click="handleFilter('voiceroom')">
            {{ t('list.voice') }}
          </a>
        </div>
      </div>

      <div ref="gridRef" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <LiveCard v-for="room in rooms" :key="room.roomId" :room="room" class="live-item" />
      </div>

      <div v-if="rooms.length === 0 && !loading"
        class="flex flex-col items-center justify-center py-20 text-base-content/50">
        <Icon name="mingcute:box-3-line" class="text-6xl mb-4" />
        <p>{{ t('list.empty') }}</p>
      </div>

      <div class="mt-12 flex justify-center">
        <button v-if="hasMore" class="btn btn-wide" :class="{ 'btn-disabled': loading }" @click="loadMore">
          <span v-if="loading" class="loading loading-spinner"></span>
          {{ loading ? t('list.loading') : t('list.load_more') }}
        </button>
        <div v-else-if="rooms.length > 0" class="divider text-xs text-base-content/30 w-full px-20">
          {{ t('list.no_more') }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import * as LiveApi from '~/api/live'
import type { LiveRoom } from '~/api/live'
import { gsap } from 'gsap'

const { t } = useI18n()
const gridRef = ref<HTMLElement>()

const filterType = ref<'liveroom' | 'voiceroom' | undefined>()
const rooms = ref<LiveRoom[]>([])
const page = ref(1)
const pageSize = 12
const loading = ref(false)
const hasMore = ref(true)

const fetchRooms = async (reset = false) => {
  if (loading.value) return
  loading.value = true

  if (reset) {
    page.value = 1
    rooms.value = []
    hasMore.value = true
  }

  try {
    const res = await LiveApi.list({
      type: filterType.value,
      page: page.value,
      pageSize
    })
    console.log(res);

    const newRooms = res.data?.rooms || []
    rooms.value = reset ? newRooms : [...rooms.value, ...newRooms]
    hasMore.value = newRooms.length >= pageSize

    if (newRooms.length > 0) {
      nextTick(() => animateItems())
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleFilter = (type: 'liveroom' | 'voiceroom' | undefined) => {
  if (filterType.value === type) return
  filterType.value = type
  fetchRooms(true)
}

const loadMore = () => {
  page.value++
  fetchRooms()
}

useGsap((ctx) => {
  animateItems()
}, gridRef)

const animateItems = () => {
  if (!gridRef.value) return
  gsap.fromTo(
    '.live-item:not(.is-animated)',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out',
      onComplete: function () {
        // @ts-ignore
        this.targets().forEach(el => el.classList.add('is-animated'))
      }
    }
  )
}

onMounted(() => {
  fetchRooms(true)
})
</script>

<i18n lang="json">{
  "zh-CN": {
    "list": {
      "title": "热门直播",
      "all": "全部",
      "video": "视频直播",
      "voice": "语聊房",
      "empty": "暂无直播",
      "loading": "加载中...",
      "load_more": "加载更多",
      "no_more": "没有更多了"
    }
  },
  "zh-TW": {
    "list": {
      "title": "熱門直播",
      "all": "全部",
      "video": "視訊直播",
      "voice": "語聊房",
      "empty": "暫無直播",
      "loading": "加載中...",
      "load_more": "加載更多",
      "no_more": "沒有更多了"
    }
  },
  "en": {
    "list": {
      "title": "Trending",
      "all": "All",
      "video": "Live Stream",
      "voice": "Voice Room",
      "empty": "No Live Rooms",
      "loading": "Loading...",
      "load_more": "Load More",
      "no_more": "No more data"
    }
  }
}</i18n>