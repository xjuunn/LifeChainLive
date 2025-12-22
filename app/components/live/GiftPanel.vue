<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="visible" class="fixed inset-0 z-[100]" @click.self="emit('close')">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')"></div>
        
        <div class="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col overflow-hidden pb-safe">
          <div class="flex items-center justify-between p-4 border-b border-base-content/5">
            <div class="flex items-center gap-2">
              <Icon name="mingcute:gift-fill" class="text-xl text-primary" />
              <span class="font-bold text-base-content">{{ t('gift.title') }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
                <Icon name="mingcute:diamond-2-fill" class="text-warning" />
                <span class="font-bold text-warning text-sm">{{ balance }}</span>
              </div>
              <button class="btn btn-circle btn-ghost btn-sm" @click="emit('close')">
                <Icon name="mingcute:close-line" class="text-lg" />
              </button>
            </div>
          </div>

          <div v-if="loading" class="flex-1 flex items-center justify-center py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>

          <div v-else class="flex-1 overflow-y-auto p-4">
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="gift in gifts"
                :key="gift.id"
                class="flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all duration-200 border-2"
                :class="selectedGift?.id === gift.id 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-base-200/50 border-transparent hover:bg-base-200 hover:border-base-content/10'"
                @click="selectGift(gift)"
              >
                <div class="relative w-12 h-12 sm:w-14 sm:h-14">
                  <NuxtImg :src="gift.iconUrl" class="w-full h-full object-contain" :alt="gift.name" />
                </div>
                <span class="text-xs font-medium text-base-content mt-1.5 truncate w-full text-center">{{ gift.name }}</span>
                <div class="flex items-center gap-0.5 mt-0.5">
                  <Icon name="mingcute:diamond-2-fill" class="text-warning text-xs" />
                  <span class="text-xs font-bold text-warning">{{ gift.price }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-none p-4 border-t border-base-content/5 bg-base-100">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 flex-1">
                <span class="text-sm text-base-content/60">{{ t('gift.count') }}:</span>
                <div class="join">
                  <button
                    v-for="count in [1, 10, 66, 99]"
                    :key="count"
                    class="join-item btn btn-sm"
                    :class="giftCount === count ? 'btn-primary' : 'btn-ghost'"
                    @click="giftCount = count"
                  >
                    {{ count }}
                  </button>
                </div>
              </div>
              <button
                class="btn btn-primary shadow-lg shadow-primary/30 gap-2"
                :disabled="!selectedGift || sending || !canAfford"
                @click="handleSend"
              >
                <span v-if="sending" class="loading loading-spinner loading-sm"></span>
                <template v-else>
                  <Icon name="mingcute:send-plane-fill" />
                  <span>{{ t('gift.send') }}</span>
                </template>
              </button>
            </div>
            <div v-if="selectedGift && !canAfford" class="mt-2 text-xs text-error text-center">
              {{ t('gift.insufficient') }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import * as GiftApi from '~/api/gift'
import type { Gift, GiftMessage } from '~/api/gift'

const props = defineProps<{
  visible: boolean
  roomId: string
  ownerId: string
  ownerName: string
}>()

const emit = defineEmits<{
  close: []
  send: [message: GiftMessage]
}>()

const { t } = useI18n()
const toast = useToast()

const loading = ref(true)
const sending = ref(false)
const gifts = ref<Gift[]>([])
const selectedGift = ref<Gift | null>(null)
const giftCount = ref(1)
const balance = ref(0)

const canAfford = computed(() => {
  if (!selectedGift.value) return true
  return balance.value >= selectedGift.value.price * giftCount.value
})

const loadGifts = async () => {
  loading.value = true
  try {
    const res = await GiftApi.list()
    gifts.value = res.data.gifts
    if (gifts.value.length > 0) {
      selectedGift.value = gifts.value[0]
    }
  } catch (e) {
    console.error('Failed to load gifts:', e)
  } finally {
    loading.value = false
  }
}

const loadBalance = async () => {
  try {
    const userId = localStorage.getItem('userId') || 'guest'
    const res = await GiftApi.getBalance(userId)
    balance.value = res.data.diamonds
  } catch (e) {
    balance.value = 0
  }
}

const selectGift = (gift: Gift) => {
  selectedGift.value = gift
}

const handleSend = async () => {
  if (!selectedGift.value || sending.value || !canAfford.value) return

  const gift = selectedGift.value
  const count = giftCount.value
  const totalPrice = gift.price * count

  const userId = localStorage.getItem('userId') || 'guest_' + Date.now()
  const userName = localStorage.getItem('userName') || t('gift.guest')
  const userAvatar = localStorage.getItem('userAvatar') || ''

  const prevBalance = balance.value
  balance.value -= totalPrice

  const giftMessage: GiftMessage = {
    type: 'gift',
    gift: gift,
    giftCount: count,
    totalPrice: totalPrice,
    sender: {
      userId,
      userName,
      avatarUrl: userAvatar
    }
  }
  emit('send', giftMessage)

  sending.value = true
  try {
    const res = await GiftApi.send({
      senderId: userId,
      senderName: userName,
      senderAvatar: userAvatar,
      receiverId: props.ownerId,
      receiverName: props.ownerName,
      roomId: props.roomId,
      giftId: gift.id,
      giftCount: count
    })
    balance.value = res.data.newBalance
    toast.success(t('gift.send_success'))
  } catch (e: any) {
    balance.value = prevBalance
    if (e.message?.includes('INSUFFICIENT_BALANCE') || e.message?.includes('余额不足')) {
      toast.error(t('gift.insufficient'))
    } else {
      toast.error(t('gift.send_failed'))
    }
  } finally {
    sending.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    loadGifts()
    loadBalance()
  }
})

onMounted(() => {
  if (props.visible) {
    loadGifts()
    loadBalance()
  }
})
</script>

<style scoped>
.pb-safe {
  padding-bottom: max(env(safe-area-inset-bottom, 16px), 16px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-active > div:last-child,
.slide-up-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from > div:last-child,
.slide-up-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>

<i18n lang="json">{
  "zh-CN": {
    "gift": {
      "title": "送礼物",
      "count": "数量",
      "send": "发送",
      "send_success": "礼物发送成功",
      "send_failed": "发送失败，请重试",
      "insufficient": "钻石不足，请先充值",
      "guest": "游客"
    }
  },
  "zh-TW": {
    "gift": {
      "title": "送禮物",
      "count": "數量",
      "send": "發送",
      "send_success": "禮物發送成功",
      "send_failed": "發送失敗，請重試",
      "insufficient": "鑽石不足，請先充值",
      "guest": "遊客"
    }
  },
  "en": {
    "gift": {
      "title": "Send Gift",
      "count": "Count",
      "send": "Send",
      "send_success": "Gift sent successfully",
      "send_failed": "Failed to send, please retry",
      "insufficient": "Insufficient diamonds, please recharge",
      "guest": "Guest"
    }
  }
}</i18n>
