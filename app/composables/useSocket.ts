import { socket } from '~/utils/socket/core'
import type { ServerEvents } from '~/utils/socket/contract'
export function useSocketEvent<E extends keyof ServerEvents>(
  event: E,
  callback: ServerEvents[E]
) {
  onMounted(() => socket.on(event, callback))
  onUnmounted(() => socket.off(event, callback))
}
export function useSocket() {
  return {
    emit: socket.emit.bind(socket),
    request: socket.request.bind(socket),
    id: socket.id
  }
}