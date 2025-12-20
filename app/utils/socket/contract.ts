export interface SocketResponse<T = any> {
  code: number
  message?: string
  data: T
}
export interface LiveRoom {
  roomId: string
  title: string
  ownerId: string
  roomType: 'liveroom' | 'voiceroom'
  memberCount: number
  coverUrl?: string
  avatarUrl?: string
}
export interface PageParams {
  page: number
  pageSize: number
  type?: string
}
export interface ListResponse {
  rooms: LiveRoom[]
  total: number
}
export interface ServerEvents {
  'live:room:created': (room: LiveRoom) => void
  'live:room:ended': (data: { roomId: string }) => void
  'error': (err: any) => void
}
export interface ClientEvents {
  'live:list': (
    data: PageParams,
    ack: (res: SocketResponse<ListResponse>) => void
  ) => void
  'room:join': (
    data: { roomId: string },
    ack: (res: SocketResponse<void>) => void
  ) => void
  'room:leave': (
    data: { roomId: string },
    ack: (res: SocketResponse<void>) => void
  ) => void
}