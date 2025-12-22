import { api } from '~/utils/api.util';

const base = "/livekit/linkmic";

/** 连麦状态枚举 */
export enum LinkStatus {
  NONE = 'none',
  APPLYING = 'applying',
  LINKING = 'linking'
}

/** 麦位信息 */
export interface SeatInfo {
  index: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  isAudioLocked: boolean;
  isVideoLocked: boolean;
}

/** 用户信息 */
export interface UserInfo {
  userId: string;
  userName: string;
  avatarUrl: string;
}

/** 申请上麦请求 */
export interface ApplyToTakeSeatRequest {
  roomId: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  seatIndex?: number;
  timeout?: number;
}

/** 响应申请请求 */
export interface RespondToApplicationRequest {
  roomId: string;
  userId: string;
  agree: boolean;
}

/**
 * 申请上麦
 */
export function applyToTakeSeat(data: ApplyToTakeSeatRequest) {
  return api.post<{ seatIndex: number }>(base + '/apply', data);
}

/**
 * 取消申请
 */
export function cancelApplication(roomId: string, userId: string) {
  return api.post<void>(base + '/cancel', { roomId, userId });
}

/**
 * 主动下麦
 */
export function leaveSeat(roomId: string, userId: string) {
  return api.post<void>(base + '/leave', { roomId, userId });
}

/**
 * 主播响应申请
 */
export function respondToApplication(data: RespondToApplicationRequest) {
  return api.post<void>(base + '/respond', data);
}

/**
 * 主播踢人下麦
 */
export function kickUserOffSeat(roomId: string, userId: string) {
  return api.post<void>(base + '/kick', { roomId, userId });
}

/**
 * 锁定/解锁麦位
 */
export function lockSeat(roomId: string, seatIndex: number, lockAudio: boolean, lockVideo: boolean) {
  return api.post<void>(base + '/lock', { roomId, seatIndex, lockAudio, lockVideo });
}

/**
 * 获取申请列表（主播端）
 */
export function getApplicantList(roomId: string) {
  return api.get<{ applicants: UserInfo[] }>(base + '/applicants', { roomId });
}
