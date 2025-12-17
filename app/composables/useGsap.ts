import { gsap } from 'gsap'

/**
 * 封装 GSAP Context 以确保组件卸载时自动清理动画
 * @param scope Ref<HTMLElement | undefined> 或选择器字符串
 * @param callback 动画回调函数
 */
export const useGsap = (
  callback: (context: gsap.Context) => void,
  scope?: object | string
) => {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(callback, scope)
  })

  onUnmounted(() => {
    ctx?.revert() // 清理动画、ScrollTrigger 和事件监听，防止内存泄漏
  })

  return {
    ctx
  }
}