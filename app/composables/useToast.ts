import { ref } from 'vue'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

// 全局状态，保证在任何组件调用时都是同一个列表
const toasts = ref<Toast[]>([])

export const useToast = () => {
  /**
   * 移除 Toast
   */
  const remove = (id: string) => {
    const index = toasts.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * 添加 Toast
   * @param message 消息内容
   * @param type 类型 (默认 info)
   * @param duration 持续时间 (默认 3000ms)
   */
  const show = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2)

    const toast: Toast = {
      id,
      message,
      type,
      duration
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  return {
    toasts,
    show,
    remove,
    info: (msg: string, duration?: number) => show(msg, 'info', duration),
    success: (msg: string, duration?: number) => show(msg, 'success', duration),
    warning: (msg: string, duration?: number) => show(msg, 'warning', duration),
    error: (msg: string, duration?: number) => show(msg, 'error', duration)
  }
}