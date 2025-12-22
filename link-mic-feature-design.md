# 连麦功能设计文档

> 本文档整理自 APP 端实现，用于网页版开发参考

---

## 一、功能概览

连麦系统包含两大场景：

| 场景 | 说明 | 核心功能 |
|------|------|----------|
| **直播连麦 (CoGuest)** | 观众申请与主播视频/音频连麦 | 申请上麦、同意/拒绝、下麦、踢人 |
| **主播连麦 (CoHost)** | 主播之间跨房间PK连麦 | 邀请连麦、接受/拒绝、断开连麦 |
| **语聊房麦位 (Seat)** | 语音聊天房的麦位管理 | 上麦、下麦、抱人上麦、踢人下麦、锁麦 |

---

## 二、数据结构

### 2.1 连麦状态枚举

```typescript
// 直播间观众连麦状态
enum CoGuestStatus {
  NONE = 'none',           // 未连麦
  APPLYING = 'applying',   // 申请中
  LINKING = 'linking'      // 连麦中
}

// 主播跨房连麦状态
enum ConnectionStatus {
  UNKNOWN = 'unknown',     // 未知
  INVITING = 'inviting'    // 邀请中
}

// 语聊房连麦状态
enum LinkStatus {
  NONE = 'none',           // 未上麦
  APPLYING = 'applying',   // 申请中
  LINKING = 'linking'      // 已上麦
}
```

### 2.2 麦位信息 (SeatInfo)

```typescript
interface SeatInfo {
  index: number;           // 麦位索引 (0-N)
  userId: string;          // 用户ID (空表示空麦位)
  userName: string;        // 用户昵称
  avatarUrl: string;       // 用户头像
  isAudioLocked: boolean;  // 麦克风是否被锁定
  isVideoLocked: boolean;  // 摄像头是否被锁定
}
```

### 2.3 连麦用户信息 (ConnectionUser)

```typescript
interface ConnectionUser {
  roomId: string;              // 房间ID
  userId: string;              // 用户ID
  userName: string;            // 用户昵称
  avatarUrl: string;           // 头像URL
  joinConnectionTime: number;  // 加入连麦时间戳
  connectionStatus: ConnectionStatus;  // 连麦状态
}
```

### 2.4 请求类型

```typescript
enum RequestType {
  APPLY_TO_TAKE_SEAT = 'apply_to_take_seat',    // 观众申请上麦
  INVITE_TO_TAKE_SEAT = 'invite_to_take_seat'   // 主播邀请上麦
}
```

---

## 三、直播间观众连麦 (CoGuest)

### 3.1 功能流程

```
观众端                                    主播端
  │                                         │
  ├─── 1. 申请连麦 ──────────────────────>  │
  │         (applyToTakeSeat)               │
  │                                         │
  │  <── 2. 收到申请通知 ───────────────────┤
  │         (onGuestApplicationReceived)    │
  │                                         │
  │  <── 3a. 同意连麦 ──────────────────────┤
  │         (respondToApplication: accept)  │
  │                                         │
  │  <── 3b. 拒绝连麦 ──────────────────────┤
  │         (respondToApplication: reject)  │
  │                                         │
  ├─── 4. 连麦成功，开始推流 ────────────>  │
  │         (startPublish)                  │
  │                                         │
  ├─── 5. 主动下麦 ─────────────────────>   │
  │         (leaveSeat)                     │
  │                                         │
  │  <── 6. 被主播踢下麦 ───────────────────┤
  │         (kickUserOffSeat)               │
```

### 3.2 核心API

#### 观众端

```typescript
// 申请上麦
interface ApplyToTakeSeatParams {
  seatIndex?: number;  // 麦位索引，-1表示自动分配
  timeout: number;     // 超时时间(秒)，默认60
}

function applyToTakeSeat(params: ApplyToTakeSeatParams): Promise<void>;

// 取消申请
function cancelApplication(): Promise<void>;

// 主动下麦
function leaveSeat(): Promise<void>;
```

#### 主播端

```typescript
// 同意/拒绝申请
function respondToApplication(userId: string, agree: boolean): Promise<void>;

// 邀请观众上麦
interface InviteToSeatParams {
  userId: string;
  seatIndex: number;
  timeout: number;
}
function inviteToSeat(params: InviteToSeatParams): Promise<void>;

// 踢人下麦
function kickUserOffSeat(userId: string): Promise<void>;

// 锁定麦位 (禁止音频/视频)
interface SeatLockParams {
  lockAudio: boolean;
  lockVideo: boolean;
}
function lockSeat(seatIndex: number, params: SeatLockParams): Promise<void>;
```

### 3.3 事件回调

```typescript
interface CoGuestListener {
  // 观众端收到邀请
  onHostInvitationReceived(hostUser: UserInfo): void;
  
  // 观众端申请被处理
  onGuestApplicationResponded(isAccept: boolean, hostUser: UserInfo): void;
  
  // 主播端收到申请
  onGuestApplicationReceived(guestUser: UserInfo): void;
  
  // 申请被取消
  onGuestApplicationCancelled(guestUser: UserInfo): void;
  
  // 邀请被响应
  onHostInvitationResponded(isAccept: boolean, guestUser: UserInfo): void;
  
  // 被踢下麦
  onKickedOffSeat(userInfo: UserInfo): void;
  
  // 麦位列表变化
  onSeatListChanged(seatList: SeatInfo[], seatedList: SeatInfo[], leftList: SeatInfo[]): void;
}
```

### 3.4 状态管理

```typescript
interface CoGuestState {
  // 已连麦用户列表
  connectedUserList: SeatInfo[];
  
  // 申请连麦用户列表 (主播端使用)
  applicantList: UserInfo[];
  
  // 当前连麦状态
  coGuestStatus: CoGuestStatus;
  
  // 被禁麦用户列表
  lockAudioUserList: Set<string>;
  
  // 被禁摄像头用户列表
  lockVideoUserList: Set<string>;
}
```

---

## 四、主播跨房连麦 (CoHost)

### 4.1 功能流程

```
主播A                                      主播B
  │                                          │
  ├─── 1. 发起连麦邀请 ─────────────────>    │
  │         (requestCrossRoomConnection)     │
  │                                          │
  │  <── 2. 收到连麦请求 ────────────────────┤
  │         (onCrossRoomConnectionRequest)   │
  │                                          │
  │  <── 3a. 接受连麦 ───────────────────────┤
  │         (respondToCrossRoomConnection)   │
  │                                          │
  │  <── 3b. 拒绝连麦 ───────────────────────┤
  │                                          │
  ├─── 4. 连麦成功，双方视频互通 ─────────>  │
  │         (onConnectedRoomsUpdated)        │
  │                                          │
  ├─── 5. 断开连麦 ──────────────────────>   │
  │         (terminateCrossRoomConnection)   │
```

### 4.2 核心API

```typescript
// 获取推荐连麦主播列表
function fetchLiveList(cursor: string, count: number): Promise<{
  liveInfoList: LiveInfo[];
  cursor: string;
}>;

// 发起跨房连麦请求
function requestCrossRoomConnection(roomId: string, timeout: number): Promise<void>;

// 响应连麦请求
function respondToCrossRoomConnection(roomId: string, agree: boolean): Promise<void>;

// 断开连麦
function terminateCrossRoomConnection(): Promise<void>;
```

### 4.3 事件回调

```typescript
interface CoHostListener {
  // 收到连麦请求
  onCrossRoomConnectionRequest(roomInfo: ConnectionUser): void;
  
  // 请求被接受
  onCrossRoomConnectionAccepted(roomInfo: ConnectionUser): void;
  
  // 请求被拒绝
  onCrossRoomConnectionRejected(roomInfo: ConnectionUser): void;
  
  // 请求超时
  onCrossRoomConnectionTimeout(inviter: ConnectionUser, invitee: ConnectionUser): void;
  
  // 连麦列表更新
  onConnectedRoomsUpdated(roomList: ConnectionUser[]): void;
  
  // 连麦结束
  onCrossRoomConnectionExited(roomInfo: ConnectionUser): void;
}
```

### 4.4 状态管理

```typescript
interface CoHostState {
  // 推荐主播列表
  recommendUsers: ConnectionUser[];
  
  // 已连麦主播列表
  connectedUserList: ConnectionUser[];
  
  // 已发送的连麦请求列表
  sentConnectionRequestList: ConnectionUser[];
  
  // 收到的连麦请求
  receivedConnectionRequest: ConnectionUser | null;
  
  // 分页游标
  recommendedCursor: string;
  
  // 是否还有更多
  isLastPage: boolean;
}
```

---

## 五、语聊房麦位管理 (VoiceRoom Seat)

### 5.1 麦位布局配置

```typescript
// 布局模式
enum LayoutMode {
  FOCUS = 'focus',       // 焦点模式 (1大+多小)
  GRID = 'grid',         // 网格模式
  VERTICAL = 'vertical', // 垂直模式
  FREE = 'free'          // 自由模式
}

// 行对齐方式
enum SeatViewLayoutRowAlignment {
  SPACE_AROUND = 'space_around',
  SPACE_BETWEEN = 'space_between',
  SPACE_EVENLY = 'space_evenly',
  START = 'start',
  END = 'end',
  CENTER = 'center'
}

// 麦位布局配置
interface SeatViewLayoutConfig {
  rowConfigs: SeatViewLayoutRowConfig[];
  rowSpacing: number;  // 行间距
}

interface SeatViewLayoutRowConfig {
  count: number;           // 每行麦位数
  seatSpacing: number;     // 麦位间距
  seatSize: { width: number; height: number };
  alignment: SeatViewLayoutRowAlignment;
}
```

### 5.2 核心API

```typescript
// 上麦
function takeSeat(index: number, timeout: number): Promise<RequestCallback>;

// 下麦
function leaveSeat(): Promise<void>;

// 移动麦位
function moveToSeat(index: number): Promise<void>;

// 主播邀请上麦
function takeUserOnSeatByAdmin(index: number, userId: string, timeout: number): Promise<RequestCallback>;

// 主播踢人下麦
function kickUserOffSeatByAdmin(userId: string): Promise<void>;

// 锁定麦位
function lockSeat(seatIndex: number, params: SeatLockParams): Promise<void>;

// 取消申请
function cancelRequest(userId: string): Promise<void>;
```

### 5.3 请求回调

```typescript
interface RequestCallback {
  onAccepted(userInfo: UserInfo): void;
  onRejected(userInfo: UserInfo): void;
  onCancelled(userInfo: UserInfo): void;
  onTimeout(userInfo: UserInfo): void;
  onError(userInfo: UserInfo, error: Error, message: string): void;
}
```

### 5.4 状态管理

```typescript
interface SeatState {
  // 麦位列表
  seatList: SeatInfo[];
  
  // 连麦状态
  linkStatus: LinkStatus;
  
  // 申请上麦用户列表
  seatApplicationList: UserInfo[];
  
  // 收到的上麦邀请
  receivedSeatInvitation: UserInfo | null;
}
```

---

## 六、网页版实现建议

### 6.1 观众连麦组件

```tsx
// components/CoGuestPanel.tsx
import React, { useState } from 'react';

interface CoGuestPanelProps {
  roomId: string;
  status: CoGuestStatus;
  onApply: () => void;
  onCancel: () => void;
  onLeave: () => void;
}

export function CoGuestPanel({ roomId, status, onApply, onCancel, onLeave }: CoGuestPanelProps) {
  const renderButton = () => {
    switch (status) {
      case 'none':
        return <button onClick={onApply}>申请连麦</button>;
      case 'applying':
        return <button onClick={onCancel}>取消申请</button>;
      case 'linking':
        return <button onClick={onLeave}>结束连麦</button>;
    }
  };

  return (
    <div className="co-guest-panel">
      {renderButton()}
    </div>
  );
}
```

### 6.2 主播连麦管理面板

```tsx
// components/AnchorCoGuestManageDialog.tsx
interface ManageDialogProps {
  connectedUsers: SeatInfo[];
  applicants: UserInfo[];
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
  onKick: (userId: string) => void;
  onMute: (userId: string, type: 'audio' | 'video') => void;
}

export function AnchorCoGuestManageDialog({
  connectedUsers,
  applicants,
  onAccept,
  onReject,
  onKick,
  onMute
}: ManageDialogProps) {
  return (
    <div className="manage-dialog">
      {/* 已连麦用户列表 */}
      <section>
        <h3>连麦中 ({connectedUsers.length})</h3>
        {connectedUsers.map(user => (
          <div key={user.userId} className="user-item">
            <img src={user.avatarUrl} />
            <span>{user.userName}</span>
            <button onClick={() => onMute(user.userId, 'audio')}>
              {user.isAudioLocked ? '解除禁麦' : '禁麦'}
            </button>
            <button onClick={() => onKick(user.userId)}>踢下麦</button>
          </div>
        ))}
      </section>

      {/* 申请列表 */}
      <section>
        <h3>申请上麦 ({applicants.length})</h3>
        {applicants.map(user => (
          <div key={user.userId} className="user-item">
            <img src={user.avatarUrl} />
            <span>{user.userName}</span>
            <button onClick={() => onAccept(user.userId)}>同意</button>
            <button onClick={() => onReject(user.userId)}>拒绝</button>
          </div>
        ))}
      </section>
    </div>
  );
}
```

### 6.3 语聊房麦位视图

```tsx
// components/SeatGridView.tsx
interface SeatGridViewProps {
  seats: SeatInfo[];
  selfUserId: string;
  isOwner: boolean;
  onSeatClick: (seat: SeatInfo) => void;
}

export function SeatGridView({ seats, selfUserId, isOwner, onSeatClick }: SeatGridViewProps) {
  return (
    <div className="seat-grid">
      {seats.map((seat, index) => (
        <div
          key={index}
          className={`seat-item ${seat.userId ? 'occupied' : 'empty'}`}
          onClick={() => onSeatClick(seat)}
        >
          {seat.userId ? (
            <>
              <img src={seat.avatarUrl} className="avatar" />
              <span className="name">{seat.userName}</span>
              {seat.isAudioLocked && <span className="muted-icon">🔇</span>}
            </>
          ) : (
            <div className="empty-seat">
              <span>空麦位</span>
              <span className="seat-number">{index + 1}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 6.4 麦位操作菜单

```tsx
// components/SeatActionSheet.tsx
interface SeatActionSheetProps {
  seat: SeatInfo;
  selfUserId: string;
  isOwner: boolean;
  linkStatus: LinkStatus;
  onTakeSeat: (index: number) => void;
  onLeaveSeat: () => void;
  onKickUser: (userId: string) => void;
  onMuteUser: (userId: string) => void;
  onInviteUser: () => void;
}

export function SeatActionSheet({
  seat,
  selfUserId,
  isOwner,
  linkStatus,
  onTakeSeat,
  onLeaveSeat,
  onKickUser,
  onMuteUser,
  onInviteUser
}: SeatActionSheetProps) {
  const actions = generateActions();

  function generateActions() {
    const list = [];
    const isSelf = seat.userId === selfUserId;
    const isEmpty = !seat.userId;

    if (isEmpty) {
      // 空麦位
      if (isOwner) {
        list.push({ label: '邀请上麦', action: onInviteUser });
      } else if (linkStatus === 'none') {
        list.push({ label: '申请上麦', action: () => onTakeSeat(seat.index) });
      }
    } else if (isSelf) {
      // 自己的麦位
      list.push({ label: '下麦', action: onLeaveSeat });
    } else if (isOwner) {
      // 主播查看其他人
      list.push({ label: seat.isAudioLocked ? '解除禁麦' : '禁麦', action: () => onMuteUser(seat.userId) });
      list.push({ label: '踢下麦', action: () => onKickUser(seat.userId) });
    }

    return list;
  }

  return (
    <div className="action-sheet">
      {actions.map((item, index) => (
        <button key={index} onClick={item.action}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 七、WebRTC/实时通信集成

### 7.1 推荐方案

| 方案 | 说明 | 适用场景 |
|------|------|----------|
| **腾讯云TRTC Web SDK** | 与APP端完全兼容 | 需要与APP互通 |
| **Agora Web SDK** | 高质量音视频 | 独立网页版 |
| **WebRTC + Socket.IO** | 自建方案 | 完全自定义 |

### 7.2 TRTC Web SDK 示例

```typescript
import TRTC from 'trtc-js-sdk';

// 创建客户端
const client = TRTC.createClient({
  mode: 'live',
  sdkAppId: YOUR_SDK_APP_ID,
  userId: userId,
  userSig: userSig
});

// 进入房间
await client.join({ roomId: roomId });

// 创建本地流
const localStream = TRTC.createStream({
  userId: userId,
  audio: true,
  video: true
});
await localStream.initialize();

// 发布流 (上麦)
await client.publish(localStream);

// 取消发布 (下麦)
await client.unpublish(localStream);

// 订阅远端流
client.on('stream-added', event => {
  const remoteStream = event.stream;
  client.subscribe(remoteStream);
});

client.on('stream-subscribed', event => {
  const remoteStream = event.stream;
  remoteStream.play('remote-video-container');
});
```

---

## 八、信令消息格式

### 8.1 连麦请求消息

```json
{
  "type": "link_mic_request",
  "action": "apply",
  "data": {
    "userId": "user123",
    "userName": "用户昵称",
    "avatarUrl": "https://...",
    "seatIndex": -1,
    "timestamp": 1703232000000
  }
}
```

### 8.2 连麦响应消息

```json
{
  "type": "link_mic_response",
  "action": "accept",
  "data": {
    "userId": "user123",
    "seatIndex": 2,
    "timestamp": 1703232000000
  }
}
```

### 8.3 麦位变化通知

```json
{
  "type": "seat_changed",
  "data": {
    "seatList": [
      { "index": 0, "userId": "anchor", "userName": "主播", "avatarUrl": "..." },
      { "index": 1, "userId": "user1", "userName": "用户1", "avatarUrl": "..." },
      { "index": 2, "userId": "", "userName": "", "avatarUrl": "" }
    ],
    "seatedList": [{ "index": 1, "userId": "user1" }],
    "leftList": []
  }
}
```

---

## 九、关键注意事项

| 要点 | 说明 |
|------|------|
| **权限检查** | 上麦前检查麦克风/摄像头权限 |
| **超时处理** | 申请超时默认60秒，需要UI反馈 |
| **状态同步** | 连麦状态需要所有端同步 |
| **音视频质量** | 根据网络自适应码率 |
| **断线重连** | 网络断开后自动重连 |
| **麦位数量限制** | 直播间通常限制8-9个麦位 |

---

## 十、核心文件参考

| 功能 | 核心文件路径 |
|------|-------------|
| 观众连麦管理 | `features/audiencecontainer/manager/module/CoGuestManager.java` |
| 主播连麦管理 | `features/anchorboardcast/manager/module/CoHostManager.java` |
| 语聊房麦位 | `voiceroomcore/SeatGridView.kt` |
| 麦位操作菜单 | `voiceroom/view/seatmanager/SeatActionSheetGenerator.java` |
| 连麦状态 | `features/audiencecontainer/state/CoGuestState.java` |
| 跨房连麦状态 | `features/anchorboardcast/state/CoHostState.java` |

---

## 十一、网页版开发注意事项

### 11.1 权限问题 - 最容易踩坑

```typescript
// 必须在用户交互后请求权限
async function requestMediaPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    return stream;
  } catch (e) {
    // 用户拒绝或浏览器不支持
    if (e.name === 'NotAllowedError') {
      toast.error('请允许摄像头/麦克风权限');
    }
  }
}
```

| 注意点 | 说明 |
|--------|------|
| **HTTPS强制** | 摄像头/麦克风API必须在HTTPS环境 |
| **用户交互触发** | 必须在点击事件中请求权限 |
| **权限被拒后处理** | 需引导用户手动开启 |

---

### 11.2 状态同步 - 多端一致性

APP和网页需要实时同步麦位状态：

```typescript
// 监听麦位变化
socket.on('seat_changed', (data) => {
  // 更新本地状态
  setSeatList(data.seatList);
  
  // 检查自己是否被踢
  const selfSeated = data.seatList.some(s => s.userId === selfUserId);
  if (!selfSeated && linkStatus === 'linking') {
    // 被踢下麦，停止推流
    stopPublish();
    setLinkStatus('none');
  }
});
```

---

### 11.3 超时处理 - 必须实现

```typescript
const APPLY_TIMEOUT = 60000; // 60秒

function applyToTakeSeat() {
  setLinkStatus('applying');
  
  const timer = setTimeout(() => {
    if (linkStatus === 'applying') {
      setLinkStatus('none');
      toast.error('申请超时，请重试');
    }
  }, APPLY_TIMEOUT);
  
  // 收到响应时清除定时器
  return () => clearTimeout(timer);
}
```

---

### 11.4 音视频质量自适应

```typescript
// 根据网络状况调整码率
const qualityPresets = {
  high: { width: 640, height: 480, frameRate: 15, bitrate: 800 },
  medium: { width: 480, height: 360, frameRate: 15, bitrate: 500 },
  low: { width: 320, height: 240, frameRate: 10, bitrate: 300 }
};

// 网络差时降级
client.on('network-quality', (stats) => {
  if (stats.uplinkNetworkQuality > 3) {
    localStream.setVideoProfile(qualityPresets.low);
  }
});
```

---

### 11.5 断线重连 - 关键体验

```typescript
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

client.on('connection-state-changed', (state) => {
  if (state === 'DISCONNECTED') {
    if (reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++;
      setTimeout(() => client.join(roomParams), 2000 * reconnectAttempts);
    } else {
      toast.error('网络连接失败，请检查网络');
    }
  } else if (state === 'CONNECTED') {
    reconnectAttempts = 0;
  }
});
```

---

### 11.6 移动端H5特殊问题

| 问题 | 解决方案 |
|------|----------|
| **iOS Safari自动播放限制** | 必须用户点击后才能播放音频 |
| **切后台停止推流** | 监听 `visibilitychange` 事件 |
| **屏幕旋转** | 动态调整视频容器尺寸 |
| **低功耗模式** | 降低帧率和分辨率 |

```typescript
// iOS Safari 音频播放解锁
document.addEventListener('click', () => {
  const audio = new Audio();
  audio.play().catch(() => {});
}, { once: true });

// 切后台处理
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    localStream?.muteVideo();
  } else {
    localStream?.unmuteVideo();
  }
});
```

---

### 11.7 与APP端互通关键点

如果需要与APP端互通，**必须使用相同的SDK**：

```typescript
// 腾讯云TRTC Web SDK
import TRTC from 'trtc-js-sdk';

// 房间号格式必须一致
const roomId = parseInt(roomIdStr); // 数字类型

// userSig生成算法必须一致
const userSig = generateUserSig(userId, sdkAppId, secretKey);
```

---

### 11.8 快速排查清单

| 问题 | 检查点 |
|------|--------|
| 看不到对方画面 | 1. 是否订阅了远端流 2. DOM容器是否存在 |
| 听不到声音 | 1. 是否被静音 2. iOS是否解锁音频 |
| 连麦失败 | 1. 权限是否授予 2. 房间号是否一致 |
| 画面卡顿 | 1. 网络状况 2. 码率是否过高 |

---

### 11.9 推荐开发顺序

1. ✅ 权限请求与检测
2. ✅ 基础推拉流测试
3. ✅ 申请/同意/拒绝流程
4. ✅ 状态同步与UI更新
5. ⭐ 断线重连
6. ⭐ 移动端H5兼容
7. ⭐ 音视频质量优化

---

*文档生成时间: 2024-12-22*
