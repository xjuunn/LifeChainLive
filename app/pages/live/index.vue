<template>
  <div class="h-full bg-base-200/30">
    <main class="container mx-auto px-4 py-8 lg:px-8">
      <div class="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="h-8 w-1.5 rounded-full bg-primary"></div>
          <h1 class="text-3xl font-extrabold tracking-tight text-base-content">
            {{ t('list.title') }}
          </h1>
        </div>

        <div class="tabs tabs-boxed bg-base-100 p-1 shadow-sm border border-base-content/5">
          <a class="tab h-9 rounded-lg px-6 text-sm font-medium transition-all"
            :class="{ 'tab-active !bg-primary !text-primary-content shadow-md': !filterType }"
            @click="handleFilter(undefined)">
            {{ t('list.all') }}
          </a>
          <a class="tab h-9 rounded-lg px-6 text-sm font-medium transition-all"
            :class="{ 'tab-active !bg-primary !text-primary-content shadow-md': filterType === 'liveroom' }"
            @click="handleFilter('liveroom')">
            {{ t('list.video') }}
          </a>
          <a class="tab h-9 rounded-lg px-6 text-sm font-medium transition-all"
            :class="{ 'tab-active !bg-primary !text-primary-content shadow-md': filterType === 'voiceroom' }"
            @click="handleFilter('voiceroom')">
            {{ t('list.voice') }}
          </a>
        </div>
      </div>

      <div ref="gridRef" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <LiveCard v-for="room in rooms" :key="room.roomId" :room="room" class="live-item opacity-0 translate-y-8" />
      </div>

      <div v-if="loading && rooms.length === 0"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <div v-for="i in 8" :key="i" class="flex flex-col gap-4 rounded-2xl bg-base-100 p-4 shadow-sm h-[300px]">
          <div class="skeleton h-40 w-full rounded-xl"></div>
          <div class="skeleton h-4 w-28"></div>
          <div class="skeleton h-4 w-full"></div>
          <div class="mt-auto flex items-center gap-2">
            <div class="skeleton h-8 w-8 rounded-full"></div>
            <div class="skeleton h-4 w-20"></div>
          </div>
        </div>
      </div>

      <div v-if="rooms.length === 0 && !loading"
        class="flex flex-col items-center justify-center py-32 animate-fade-in">
        <div class="relative mb-6">
          <div class="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl"></div>
          <Icon name="mingcute:tv-2-line" class="relative text-8xl text-base-content/20" />
        </div>
        <p class="text-lg font-medium text-base-content/60">{{ t('list.empty') }}</p>
      </div>

      <div class="mt-16 flex justify-center pb-12">
        <button v-if="hasMore" class="btn btn-primary btn-wide shadow-lg shadow-primary/20"
          :class="{ 'btn-disabled opacity-50': loading }" @click="loadMore">
          <span v-if="loading" class="loading loading-spinner"></span>
          {{ loading ? t('list.loading') : t('list.load_more') }}
        </button>
        <div v-else-if="rooms.length > 0" class="divider w-full max-w-md mx-auto text-xs text-base-content/30">
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

const { t } = useI18n({ useScope: 'local' })
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

    const newRooms = res.data?.rooms || []
    rooms.value = reset ? newRooms : [...rooms.value, ...newRooms]
    hasMore.value = newRooms.length >= pageSize

    if (newRooms.length > 0) {
      await nextTick()
      animateItems()
    }
  } catch (error) {
    console.error('Fetch rooms error:', error)
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

const animateItems = () => {
  if (!gridRef.value) return

  const items = gridRef.value.querySelectorAll('.live-item:not(.is-animated)')
  if (items.length === 0) return

  gsap.fromTo(
    items,
    { opacity: 0, y: 50, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power3.out',
      onComplete: () => {
        items.forEach(el => el.classList.add('is-animated'))
      }
    }
  )
}

useGsap((ctx) => {
  if (rooms.value.length > 0) {
    animateItems()
  }
}, gridRef)

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
      "no_more": "没有更多内容了"
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
      "no_more": "沒有更多內容了"
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