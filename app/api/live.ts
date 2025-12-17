const base = "/livekit/live";

// 直播房间类型
export enum LiveRoomType {
  'liveroom', // 直播间
  'voiceroom', // 语聊房
}

export interface LiveListRequest {
  type?: LiveRoomType; // 直播房间类型
  page?: number;
  pageSize?: number;
}

/** 直播间或语聊房类型 */
export interface LiveRoom {
  // 直播间唯一标识，格式：`live_xxx`（直播）或 `voice_xxx`（语聊房）
  roomId: string;
  // 标题
  title: string;
  // 主播用户ID
  ownerId: string;
  // 主播昵称
  ownerNickname: string;
  // 主播头像URL
  ownerAvatar: string;
  // `liveroom`（视频直播）或 `voiceroom`（语聊房）
  roomType: string;
  // 当前在线观众人数
  memberCount: number;
  // 直播间封面图URL
  coverUrl: string;
  // 直播开始时间戳（毫秒）
  createdAt: number;
}

/**
 * 搜索房间
 * @param data 查询数据
 */
export function list(data?: LiveListRequest) {
  return api.get<{
    page: number;
    pageSize: number;
    rooms: LiveRoom[];
    total: number;
  }>(base + '/list', data);
}

/**
 * 获取房间信息
 * @param roomId 房间ID
 */
export function info(roomId: string) {
  return api.get<LiveRoom>('/info', { roomId })
}

/**
 * 加入房间
 * @param userId 用户ID
 * @param roomId 房间ID
 */
export function join(userId: string, roomId: string) {
  return api.post<{
    // 腾讯云 TRTC 应用ID，用于初始化 SDK
    sdkAppId: number;
    // 用户ID
    userId: string;
    // 用户鉴权签名，有效期 7 天
    userSig: string;
    // 直播间ID
    roomId: string;
    // 房间类型：`liveroom` 或 `voiceroom`
    roomType: string;
  }>('/join', { userId, roomId })
}