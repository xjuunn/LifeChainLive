import { io, type Socket, type ManagerOptions, type SocketOptions } from 'socket.io-client'
import type { ClientEvents, ServerEvents } from './contract'

export class SocketClient {
  private static instance: SocketClient
  private socket: Socket<ServerEvents, ClientEvents> | null = null
  private isConnected = false
  private pendingQueue: Array<() => void> = []

  private constructor() { }

  public static get(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient()
    }
    return SocketClient.instance
  }

  public init(url: string, opts?: Partial<ManagerOptions & SocketOptions>) {
    if (this.socket) return

    this.socket = io(url, {
      path: '/trtc/socket.io/',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
      ...opts
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      this.flushQueue()
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
    })
  }

  public emit<E extends keyof ClientEvents>(
    event: E,
    data: Parameters<ClientEvents[E]>[0]
  ): Promise<Parameters<Parameters<ClientEvents[E]>[1]>[0]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not initialized'))
      }

      const action = () => {
        (this.socket as any).emit(event, data, (response: any) => {
          resolve(response)
        })
      }

      if (this.isConnected) {
        action()
      } else {
        this.pendingQueue.push(action)
      }
    })
  }

  public request<E extends keyof ClientEvents, R = Parameters<Parameters<ClientEvents[E]>[1]>[0]['data']>(
    event: E,
    data: Parameters<ClientEvents[E]>[0]
  ): Promise<R> {
    return this.emit(event, data).then((res: any) => {
      return res;
    })
  }

  public on<E extends keyof ServerEvents>(event: E, callback: ServerEvents[E]) {
    (this.socket as any)?.on(event, callback)
  }

  public off<E extends keyof ServerEvents>(event: E, callback?: ServerEvents[E]) {
    (this.socket as any)?.off(event, callback)
  }

  public get id() {
    return this.socket?.id
  }

  public disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  private flushQueue() {
    while (this.pendingQueue.length) {
      this.pendingQueue.shift()?.()
    }
  }
}

export const socket = SocketClient.get()