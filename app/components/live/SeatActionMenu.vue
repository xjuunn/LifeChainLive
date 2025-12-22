<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-[100]" @click.self="emit('close')">
        <div class="absolute inset-0" @click="emit('close')"></div>
        
        <div
          class="absolute bg-base-100 rounded-xl shadow-2xl border border-base-content/10 overflow-hidden min-w-[160px]"
          :style="{ left: position.x + 'px', top: position.y + 'px' }"
        >
          <div v-if="seat.userInfo?.userId" class="p-3 border-b border-base-content/5 flex items-center gap-2">
            <div class="avatar">
              <div class="w-8 h-8 rounded-full">
                <NuxtImg :src="avatarUrl" class="object-cover" />
              </div>
            </div>
            <span class="text-sm font-medium truncate max-w-[100px]">{{ seat.userInfo?.userName || t('seat.guest') }}</span>
          </div>

          <div class="py-1">
            <template v-if="isEmpty">
              <button
                v-if="linkStatus === 'none'"
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-base-200 flex items-center gap-2 transition-colors"
                @click="handleAction('apply')"
              >
                <Icon name="mingcute:mic-fill" class="text-primary" />
                {{ t('seat.apply') }}
              </button>
              <button
                v-else-if="linkStatus === 'applying'"
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-base-200 flex items-center gap-2 transition-colors text-warning"
                @click="handleAction('cancel')"
              >
                <Icon name="mingcute:close-circle-fill" />
                {{ t('seat.cancel_apply') }}
              </button>
            </template>

            <template v-else-if="isSelf">
              <button
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-base-200 flex items-center gap-2 transition-colors text-error"
                @click="handleAction('leave')"
              >
                <Icon name="mingcute:exit-fill" />
                {{ t('seat.leave') }}
              </button>
            </template>

            <template v-else>
              <div class="px-4 py-2 text-xs text-base-content/50">
                {{ t('seat.view_only') }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SeatInfo } from 'tuikit-atomicx-vue3'
import { LinkStatus } from '~/api/linkmic'

const props = defineProps<{
  visible: boolean
  seat: SeatInfo
  position: { x: number; y: number }
  selfUserId: string
  linkStatus: LinkStatus
}>()

const emit = defineEmits<{
  close: []
  action: [action: string, seat: SeatInfo]
}>()

const { t } = useI18n()

const isEmpty = computed(() => !props.seat.userInfo?.userId)
const isSelf = computed(() => props.seat.userInfo?.userId === props.selfUserId)

const avatarUrl = computed(() => {
  const url = props.seat.userInfo?.avatarUrl
  if (url && url.startsWith('http')) return url
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${props.seat.userInfo?.userId || 'default'}`
})

const handleAction = (action: string) => {
  emit('action', action, props.seat)
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<i18n lang="json">{
  "zh-CN": {
    "seat": {
      "apply": "申请上麦",
      "cancel_apply": "取消申请",
      "leave": "下麦",
      "view_only": "点击查看用户",
      "guest": "游客"
    }
  },
  "zh-TW": {
    "seat": {
      "apply": "申請上麥",
      "cancel_apply": "取消申請",
      "leave": "下麥",
      "view_only": "點擊查看用戶",
      "guest": "遊客"
    }
  },
  "en": {
    "seat": {
      "apply": "Request to Speak",
      "cancel_apply": "Cancel Request",
      "leave": "Leave Mic",
      "view_only": "View user profile",
      "guest": "Guest"
    }
  }
}</i18n>
