<script setup lang="ts">
/**
 * CommonModal - 通用模态框组件
 * 
 * @usage
 * <CommonModal v-model="isOpen" title="标题">
 *   内容...
 * </CommonModal>
 */

interface Props {
    modelValue: boolean
    title?: string
    maxWidth?: string // 自定义最大宽度，如 'max-w-4xl'，默认为 'max-w-lg'
    hideCloseButton?: boolean
    persistent?: boolean // 是否禁止点击遮罩关闭
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    maxWidth: 'max-w-lg',
    hideCloseButton: false,
    persistent: false
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'close'): void
    (e: 'confirm'): void
}>()

const modalRef = ref<HTMLDialogElement | null>(null)

// 监听 modelValue 变化来控制 dialog 的显示/隐藏
watch(() => props.modelValue, (val) => {
    if (!modalRef.value) return
    if (val) {
        modalRef.value.showModal()
    } else {
        modalRef.value.close()
    }
})

// 处理原生 dialog 的关闭事件 (如 ESC 键触发)
const handleNativeClose = () => {
    emit('update:modelValue', false)
    emit('close')
}

// 手动关闭
const closeModal = () => {
    emit('update:modelValue', false)
    emit('close')
}
</script>

<template>
    <dialog ref="modalRef" class="modal modal-bottom sm:modal-middle" @close="handleNativeClose">
        <!-- Modal Box -->
        <div class="modal-box relative overflow-hidden bg-base-100/80 backdrop-blur-md border border-base-content/5 shadow-2xl transition-all duration-300 flex flex-col"
            :class="[props.maxWidth]">
            <!-- 顶部 Header -->
            <div class="flex items-center justify-between mb-4">
                <h3 v-if="title" class="font-bold text-lg flex items-center gap-2">
                    <!-- 具名插槽支持自定义标题图标等 -->
                    <slot name="title-prefix"></slot>
                    {{ title }}
                </h3>
                <div v-else></div> <!-- 占位符确保关闭按钮靠右 -->

                <!-- 关闭按钮 -->
                <button v-if="!hideCloseButton" class="btn btn-sm btn-circle btn-ghost" @click="closeModal">
                    <Icon name="mingcute:close-line" class="text-xl" />
                </button>
            </div>

            <!-- 内容区域 -->
            <div class="py-2 flex-1 overflow-auto">
                <slot></slot>
            </div>

            <!-- 底部操作栏 (可选) -->
            <div v-if="$slots.actions" class="modal-action mt-6">
                <slot name="actions" :close="closeModal"></slot>
            </div>
        </div>

        <!-- 遮罩背景 (点击关闭) -->
        <form method="dialog" class="modal-backdrop">
            <button v-if="!persistent" @click="closeModal">close</button>
            <button v-else type="button" class="cursor-default">prevent close</button>
        </form>
    </dialog>
</template>

<style scoped>
/* 
  针对移动端的微调：
  确保底部弹出的圆角符合现代 App 风格 
*/
/* .modal-bottom .modal-box {
    @apply rounded-t-2xl rounded-b-none sm:rounded-2xl;
} */

/* 隐藏原生滚动条，保持美观 */
.modal-box {
    scrollbar-width: thin;
    scrollbar-color: currentColor transparent;
}
</style>