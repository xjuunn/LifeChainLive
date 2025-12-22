import { api } from '~/utils/api.util';

const base = "/livekit/gift";

/** 礼物对象 */
export interface Gift {
  id: string;
  name: string;
  iconUrl: string;
  price: number;
  animationUrl?: string;
  soundUrl?: string;
}

/** 礼物消息发送者 */
export interface GiftSender {
  userId: string;
  userName: string;
  avatarUrl: string;
}

/** 礼物消息 */
export interface GiftMessage {
  type: 'gift' | 'gift_combo';
  gift: Gift;
  giftCount: number;
  totalPrice: number;
  sender: GiftSender;
  combo?: {
    comboId: string;
    comboCount: number;
    isNewCombo: boolean;
  };
}

/** 送礼请求 */
export interface SendGiftRequest {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  roomId: string;
  giftId: string;
  giftCount: number;
}

/**
 * 获取礼物列表
 */
export function list() {
  return api.get<{ gifts: Gift[] }>(base + '/list');
}

/**
 * 发送礼物
 */
export function send(data: SendGiftRequest) {
  return api.post<{ newBalance: number }>(base + '/send', data);
}

/**
 * 获取用户余额
 */
export function getBalance(userId: string) {
  return api.get<{ diamonds: number }>('/wallet/balance', { userId });
}

/**
 * 获取贡献榜
 */
export function getRank(roomId: string, type: 'daily' | 'total' = 'daily', limit: number = 100) {
  return api.get<{ ranks: Array<{ userId: string; userName: string; avatarUrl: string; amount: number }> }>(
    base + '/rank',
    { roomId, type, limit }
  );
}
