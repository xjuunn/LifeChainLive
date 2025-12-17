<template>
  <div class="toast toast-top toast-center z-9999 w-full max-w-sm pointer-events-none p-4 fixed">
    <TransitionGroup name="toast-anim" tag="div" class="flex flex-col gap-2 w-full items-center">
      <div v-for="toast in toasts" :key="toast.id"
        class="alert shadow-lg backdrop-blur-md border border-base-content/5 pointer-events-auto flex items-start gap-3 w-auto min-w-[300px]"
        :class="{
          'alert-info bg-info/10 text-info border-info/20': toast.type === 'info',
          'alert-success bg-success/10 text-success border-success/20': toast.type === 'success',
          'alert-warning bg-warning/10 text-warning border-warning/20': toast.type === 'warning',
          'alert-error bg-error/10 text-error border-error/20': toast.type === 'error',
        }">
        <div class="mt-0.5">
          <Icon v-if="toast.type === 'info'" name="mingcute:information-fill" size="20" />
          <Icon v-else-if="toast.type === 'success'" name="mingcute:check-circle-fill" size="20" />
          <Icon v-else-if="toast.type === 'warning'" name="mingcute:warning-fill" size="20" />
          <Icon v-else-if="toast.type === 'error'" name="mingcute:close-circle-fill" size="20" />
        </div>
        <div class="flex-1 text-sm font-medium break-all text-left">
          {{ toast.message }}
        </div>
        <button @click="remove(toast.id)"
          class="btn btn-xs btn-square btn-ghost opacity-60 hover:opacity-100 -mt-1 -mr-2">
          <Icon name="mingcute:close-line" size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-anim-move,
.toast-anim-enter-active,
.toast-anim-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-anim-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-anim-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.toast-anim-leave-active {
  position: absolute;
  width: 100%;
  max-width: 300px;
}
</style>