# 礼物功能设计文档

> 本文档整理自 APP 端实现，用于网页版开发参考

---

## 一、功能概览

礼物系统包含四大核心模块：
1. **礼物列表/选择面板** - 展示可用礼物并选择发送
2. **送礼按钮** - 触发礼物面板显示
3. **礼物动画效果** - 播放礼物动画（SVGA/弹幕/豪华飘屏）
4. **礼物消息展示** - 接收并展示其他用户发送的礼物

---

## 二、数据结构

### 2.1 礼物对象 (Gift)

```typescript
interface Gift {
  giftID: string;       // 礼物唯一ID
  name: string;         // 礼物名称
  iconURL: string;      // 礼物图标URL
  coins: number;        // 礼物价格（钻石）
  resourceURL?: string; // SVGA动画URL（可选）
  soundUrl?: string;    // 音效URL（可选）
}
```

### 2.2 礼物消息 (GiftMessage)

```typescript
interface GiftMessage {
  type: "gift" | "gift_combo";  // 消息类型：普通礼物/连击礼物
  gift: {
    id: string;
    name: string;
    iconUrl: string;
    animationUrl: string;
    soundUrl: string;
    price: number;
  };
  giftCount: number;     // 礼物数量
  totalPrice: number;    // 总价
  sender: {
    userId: string;
    userName: string;
    avatarUrl: string;
  };
  combo?: {              // 连击信息（可选）
    comboId: string;
    comboCount: number;
    isNewCombo: boolean;
  };
}
```

### 2.3 礼物动画信息

```typescript
interface GiftImageAnimationInfo {
  senderAvatarUrl: string;  // 发送者头像
  senderName: string;       // 发送者昵称
  giftName: string;         // 礼物名称
  giftImageUrl: string;     // 礼物图标
  giftCount: number;        // 礼物数量
  comboId?: string;         // 连击ID
  comboCount?: number;      // 连击次数
  isCombo?: boolean;        // 是否连击
}
```

---

## 三、API 接口

### 3.1 获取礼物列表

```
GET /api/gift/list
```

**响应：**
```json
{
  "success": true,
  "data": {
    "gifts": [
      {
        "id": "gift_1",
        "name": "小心心",
        "iconUrl": "https://...",
        "price": 1,
        "animationUrl": "https://...svga",
        "soundUrl": "https://...mp3"
      }
    ]
  }
}
```

### 3.2 发送礼物

```
POST /api/gift/send
Content-Type: application/json

{
  "senderId": "user123",
  "senderName": "用户昵称",
  "senderAvatar": "https://...",
  "receiverId": "anchor123",
  "receiverName": "主播昵称",
  "roomId": "live_anchor123",
  "giftId": "gift_1",
  "giftCount": 1
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "newBalance": 999
  }
}
```

**错误响应（余额不足）：**
```json
{
  "success": false,
  "code": "INSUFFICIENT_BALANCE",
  "error": "钻石不足"
}
```

### 3.3 获取用户余额

```
GET /api/wallet/balance?userId=xxx
```

**响应：**
```json
{
  "success": true,
  "data": {
    "diamonds": 1000
  }
}
```

### 3.4 获取贡献榜

```
GET /api/gift/rank?roomId=xxx&type=daily|total&limit=100
```

---

## 四、组件实现

### 4.1 礼物列表面板 (GiftListView)

**功能职责：**
- 从服务器获取礼物列表
- 分页展示礼物（4列 × 2行 = 8个/页）
- 礼物选中状态管理
- 发送礼物（乐观更新）

**网页版实现建议：**

```tsx
// components/GiftPanel.tsx
import React, { useState, useEffect } from 'react';

interface GiftPanelProps {
  roomId: string;
  onClose: () => void;
}

export function GiftPanel({ roomId, onClose }: GiftPanelProps) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // 加载礼物列表
    fetch('/api/gift/list')
      .then(res => res.json())
      .then(data => setGifts(data.data.gifts));
    
    // 加载余额
    fetch(`/api/wallet/balance?userId=${userId}`)
      .then(res => res.json())
      .then(data => setBalance(data.data.diamonds));
  }, []);

  const handleSendGift = async (gift: Gift) => {
    // 1. 余额检查
    if (balance < gift.coins) {
      toast.error('钻石不足，请先充值');
      return;
    }
    
    // 2. 乐观更新：立即播放动画
    playGiftAnimation(gift);
    setBalance(prev => prev - gift.coins);
    
    // 3. 后台调用API
    try {
      const res = await fetch('/api/gift/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: userId,
          receiverId: anchorId,
          roomId,
          giftId: gift.giftID,
          giftCount: 1
        })
      });
      const data = await res.json();
      if (!data.success) {
        // 回滚余额
        setBalance(prev => prev + gift.coins);
        toast.error(data.error);
      }
    } catch (e) {
      setBalance(prev => prev + gift.coins);
      toast.error('发送失败');
    }
  };

  return (
    <div className="gift-panel">
      <div className="gift-grid">
        {gifts.map(gift => (
          <GiftItem
            key={gift.giftID}
            gift={gift}
            selected={selectedGift?.giftID === gift.giftID}
            onSelect={() => setSelectedGift(gift)}
            onSend={() => handleSendGift(gift)}
          />
        ))}
      </div>
      <div className="balance">💎 {balance}</div>
    </div>
  );
}
```

**CSS样式参考：**

```css
.gift-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 16px 16px 0 0;
  padding: 16px;
  z-index: 100;
}

.gift-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.gift-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.gift-item.selected {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
}

.gift-item img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.gift-item .name {
  font-size: 12px;
  color: #fff;
  margin-top: 4px;
}

.gift-item .price {
  font-size: 11px;
  color: #FFD700;
}
```

---

### 4.2 送礼按钮 (GiftButton)

**功能职责：**
- 点击弹出礼物面板
- 监听直播间状态（直播结束时关闭面板）

**网页版实现：**

```tsx
// components/GiftButton.tsx
import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { GiftPanel } from './GiftPanel';

interface GiftButtonProps {
  roomId: string;
  anchorId: string;
}

export function GiftButton({ roomId, anchorId }: GiftButtonProps) {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <button
        className="gift-button"
        onClick={() => setShowPanel(true)}
      >
        <Gift size={24} color="#FFD700" />
      </button>
      
      {showPanel && (
        <GiftPanel
          roomId={roomId}
          anchorId={anchorId}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  );
}
```

---

### 4.3 礼物动画效果

APP中有三种动画效果：

#### 4.3.1 礼物弹幕横幅 (ImageAnimationView)

**特点：**
- 最多同时显示3条弹幕
- 从左侧滑入，停留3秒后淡出
- 支持连击累加（同一用户同一礼物）
- 连击数字有放大抖动动画

**网页版实现：**

```tsx
// components/GiftBulletView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GiftBullet {
  id: string;
  senderName: string;
  senderAvatar: string;
  giftName: string;
  giftIcon: string;
  count: number;
  timestamp: number;
}

export function GiftBulletView() {
  const [bullets, setBullets] = useState<GiftBullet[]>([]);
  const maxBullets = 3;

  // 添加新礼物弹幕
  const addBullet = (bullet: Omit<GiftBullet, 'id' | 'timestamp'>) => {
    setBullets(prev => {
      // 检查是否有同一用户同一礼物的弹幕（连击）
      const existingIndex = prev.findIndex(
        b => b.senderName === bullet.senderName && b.giftName === bullet.giftName
      );
      
      if (existingIndex >= 0) {
        // 累加连击
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: updated[existingIndex].count + bullet.count,
          timestamp: Date.now()
        };
        return updated;
      }
      
      // 添加新弹幕（最多3条）
      const newBullet: GiftBullet = {
        ...bullet,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };
      
      const newList = [...prev, newBullet];
      if (newList.length > maxBullets) {
        newList.shift();
      }
      return newList;
    });
  };

  // 3秒后自动移除
  useEffect(() => {
    const timer = setInterval(() => {
      setBullets(prev => 
        prev.filter(b => Date.now() - b.timestamp < 3000)
      );
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="gift-bullets">
      <AnimatePresence>
        {bullets.map(bullet => (
          <motion.div
            key={bullet.id}
            className="gift-bullet"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <img src={bullet.senderAvatar} className="avatar" />
            <div className="info">
              <span className="sender">{bullet.senderName}</span>
              <span className="action">送出</span>
              <span className="gift-name">{bullet.giftName}</span>
            </div>
            <img src={bullet.giftIcon} className="gift-icon" />
            <motion.span
              className="count"
              key={bullet.count}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
            >
              ×{bullet.count}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

**样式：**

```css
.gift-bullets {
  position: absolute;
  left: 0;
  bottom: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 50;
}

.gift-bullet {
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, rgba(0,0,0,0.7), transparent);
  padding: 6px 16px 6px 6px;
  border-radius: 24px;
  gap: 8px;
}

.gift-bullet .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.gift-bullet .info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.gift-bullet .sender {
  color: #fff;
  font-weight: bold;
}

.gift-bullet .action {
  color: #aaa;
}

.gift-bullet .gift-name {
  color: #FFD700;
}

.gift-bullet .gift-icon {
  width: 40px;
  height: 40px;
}

.gift-bullet .count {
  font-size: 18px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
```

#### 4.3.2 SVGA全屏动画 (AnimationView)

**特点：**
- 播放SVGA格式的全屏动画
- 动画队列管理（最多缓存3个）
- 自己发送的礼物优先播放

**网页版实现（使用svga.lite库）：**

```tsx
// components/SvgaPlayer.tsx
import React, { useEffect, useRef } from 'react';
import { Parser, Player } from 'svga.lite';

interface SvgaPlayerProps {
  url: string;
  onComplete?: () => void;
}

export function SvgaPlayer({ url, onComplete }: SvgaPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    const parser = new Parser();
    const player = new Player(canvasRef.current);
    playerRef.current = player;

    parser.load(url).then(svgaData => {
      player.set({ loop: 1, fillMode: 'clear' });
      player.mount(svgaData);
      player.onEnd = () => onComplete?.();
      player.start();
    });

    return () => {
      player.stop();
      player.clear();
    };
  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      className="svga-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100
      }}
    />
  );
}
```

**动画队列管理：**

```tsx
// hooks/useGiftAnimationQueue.ts
import { useState, useCallback } from 'react';

interface GiftAnimation {
  id: string;
  url: string;
  isFromSelf: boolean;
}

export function useGiftAnimationQueue(maxSize = 3) {
  const [queue, setQueue] = useState<GiftAnimation[]>([]);
  const [current, setCurrent] = useState<GiftAnimation | null>(null);

  const add = useCallback((animation: GiftAnimation) => {
    setQueue(prev => {
      // 自己发送的礼物插入到队列前部
      let newQueue: GiftAnimation[];
      if (animation.isFromSelf) {
        const selfIndex = prev.findIndex(a => !a.isFromSelf);
        if (selfIndex === -1) {
          newQueue = [...prev, animation];
        } else {
          newQueue = [...prev.slice(0, selfIndex), animation, ...prev.slice(selfIndex)];
        }
      } else {
        newQueue = [...prev, animation];
      }
      
      // 限制队列大小
      if (newQueue.length > maxSize) {
        // 移除第一个非自己发送的
        const removeIndex = newQueue.findIndex(a => !a.isFromSelf);
        if (removeIndex > 0) {
          newQueue.splice(removeIndex, 1);
        }
      }
      
      return newQueue;
    });
  }, [maxSize]);

  const playNext = useCallback(() => {
    setQueue(prev => {
      if (prev.length > 0) {
        setCurrent(prev[0]);
        return prev.slice(1);
      }
      setCurrent(null);
      return prev;
    });
  }, []);

  return { queue, current, add, playNext };
}
```

#### 4.3.3 豪华礼物飘屏 (LuxuryGiftView)

**特点：**
- 礼物价格 >= 500 时触发
- 顶部横幅滑入显示送礼信息
- 20个礼物图标粒子从屏幕顶部飘落
- 粒子有旋转、缩放、透明度动画

**网页版实现：**

```tsx
// components/LuxuryGiftEffect.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuxuryGiftEffectProps {
  show: boolean;
  giftIcon: string;
  giftName: string;
  senderName: string;
  giftCount: number;
  onComplete: () => void;
}

export function LuxuryGiftEffect({
  show,
  giftIcon,
  giftName,
  senderName,
  giftCount,
  onComplete
}: LuxuryGiftEffectProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      // 生成20个随机粒子
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);
      
      // 4秒后结束
      setTimeout(onComplete, 4000);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="luxury-effect">
      {/* 顶部横幅 */}
      <motion.div
        className="luxury-banner"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        🎉 {senderName} 送出 {giftName} ×{giftCount} 🎉
      </motion.div>
      
      {/* 粒子飘落 */}
      {particles.map(particle => (
        <motion.img
          key={particle.id}
          src={giftIcon}
          className="luxury-particle"
          initial={{
            x: particle.x,
            y: -50,
            opacity: 1,
            scale: 0.5,
            rotate: 0
          }}
          animate={{
            y: window.innerHeight + 50,
            x: particle.x + (Math.random() - 0.5) * 200,
            opacity: [1, 1, 0.8, 0],
            scale: [0.5, 1.2, 0.8],
            rotate: Math.random() > 0.5 ? 360 : -360
          }}
          transition={{
            duration: 3,
            delay: particle.delay,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}
```

**样式：**

```css
.luxury-effect {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 200;
  overflow: hidden;
}

.luxury-banner {
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(255, 107, 0, 0.5);
}

.luxury-particle {
  position: absolute;
  width: 40px;
  height: 40px;
  object-fit: contain;
}
```

---

### 4.4 礼物消息接收

APP通过IM消息监听接收其他用户发送的礼物。

**网页版实现（WebSocket）：**

```tsx
// hooks/useGiftMessage.ts
import { useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface GiftMessageHandler {
  onGift: (message: GiftMessage) => void;
  onGiftCombo: (message: GiftMessage) => void;
}

export function useGiftMessage(roomId: string, handlers: GiftMessageHandler) {
  const { socket, connected } = useWebSocket();

  useEffect(() => {
    if (!socket || !connected) return;

    const handleMessage = (data: any) => {
      if (data.roomId !== roomId) return;
      
      if (data.type === 'gift') {
        handlers.onGift(data);
      } else if (data.type === 'gift_combo') {
        handlers.onGiftCombo(data);
      }
    };

    socket.on('gift_message', handleMessage);
    
    return () => {
      socket.off('gift_message', handleMessage);
    };
  }, [socket, connected, roomId, handlers]);
}
```

---

## 五、完整集成示例

```tsx
// components/LiveRoom.tsx
import React, { useState, useRef } from 'react';
import { GiftButton } from './GiftButton';
import { GiftBulletView } from './GiftBulletView';
import { SvgaPlayer } from './SvgaPlayer';
import { LuxuryGiftEffect } from './LuxuryGiftEffect';
import { useGiftMessage } from '../hooks/useGiftMessage';
import { useGiftAnimationQueue } from '../hooks/useGiftAnimationQueue';

const LUXURY_THRESHOLD = 500;

export function LiveRoom({ roomId, anchorId }) {
  const bulletViewRef = useRef<any>(null);
  const [luxuryEffect, setLuxuryEffect] = useState(null);
  const { current, add, playNext } = useGiftAnimationQueue();

  // 监听礼物消息
  useGiftMessage(roomId, {
    onGift: (msg) => {
      // 显示弹幕横幅
      bulletViewRef.current?.addBullet({
        senderName: msg.sender.userName,
        senderAvatar: msg.sender.avatarUrl,
        giftName: msg.gift.name,
        giftIcon: msg.gift.iconUrl,
        count: msg.giftCount
      });
      
      // 播放SVGA动画
      if (msg.gift.animationUrl) {
        add({
          id: Math.random().toString(),
          url: msg.gift.animationUrl,
          isFromSelf: false
        });
      }
      
      // 豪华礼物飘屏
      if (msg.gift.price >= LUXURY_THRESHOLD) {
        setLuxuryEffect({
          giftIcon: msg.gift.iconUrl,
          giftName: msg.gift.name,
          senderName: msg.sender.userName,
          giftCount: msg.giftCount
        });
      }
    },
    onGiftCombo: (msg) => {
      // 连击只更新弹幕数字
      bulletViewRef.current?.addBullet({
        senderName: msg.sender.userName,
        senderAvatar: msg.sender.avatarUrl,
        giftName: msg.gift.name,
        giftIcon: msg.gift.iconUrl,
        count: msg.combo.comboCount
      });
    }
  });

  return (
    <div className="live-room">
      {/* 视频播放区域 */}
      <div className="video-area">...</div>
      
      {/* 礼物弹幕 */}
      <GiftBulletView ref={bulletViewRef} />
      
      {/* SVGA动画 */}
      {current && (
        <SvgaPlayer url={current.url} onComplete={playNext} />
      )}
      
      {/* 豪华飘屏 */}
      {luxuryEffect && (
        <LuxuryGiftEffect
          show={true}
          {...luxuryEffect}
          onComplete={() => setLuxuryEffect(null)}
        />
      )}
      
      {/* 底部操作栏 */}
      <div className="bottom-bar">
        <GiftButton roomId={roomId} anchorId={anchorId} />
      </div>
    </div>
  );
}
```

---

## 六、关键特性总结

| 特性 | 说明 |
|------|------|
| **乐观更新** | 发送礼物后立即播放动画，不等待服务器响应 |
| **余额预检查** | 发送前检查缓存余额，避免无效请求 |
| **动画预加载** | 打开礼物面板时预下载所有SVGA文件 |
| **音效预加载** | 预下载所有礼物音效到本地 |
| **连击合并** | 同一用户同一礼物的连续发送合并显示 |
| **队列管理** | 动画队列最多3个，自己的礼物优先 |
| **豪华效果** | 价格>=500的礼物触发全屏飘屏 |

---

## 七、依赖库推荐

| 功能 | 推荐库 |
|------|--------|
| SVGA播放 | `svga.lite` |
| 动画效果 | `framer-motion` |
| WebSocket | `socket.io-client` |
| UI组件 | `shadcn/ui` |
| 图标 | `lucide-react` |
| 状态管理 | `zustand` |

---

## 八、文件结构建议

```
components/
├── gift/
│   ├── GiftButton.tsx        # 送礼按钮
│   ├── GiftPanel.tsx         # 礼物选择面板
│   ├── GiftItem.tsx          # 单个礼物项
│   ├── GiftBulletView.tsx    # 弹幕横幅
│   ├── SvgaPlayer.tsx        # SVGA播放器
│   └── LuxuryGiftEffect.tsx  # 豪华飘屏
│
hooks/
├── useGiftMessage.ts         # 礼物消息监听
├── useGiftAnimationQueue.ts  # 动画队列
└── useBalance.ts             # 余额管理

services/
└── giftService.ts            # 礼物API调用
```

---

*文档生成时间: 2024-12-22*

## 网页版礼物功能开发注意事项

### 1. **实时通信方案选择**

APP使用腾讯IM SDK接收礼物消息，网页版需要：
- 使用 **WebSocket** 或 **腾讯云IM Web SDK**
- 确保与APP端消息格式兼容（`type: "gift"` / `type: "gift_combo"`）
- 处理断线重连、消息去重

```typescript
// 消息格式必须与APP端一致
interface GiftMessage {
  type: "gift" | "gift_combo";
  gift: { id, name, iconUrl, animationUrl, soundUrl, price };
  sender: { userId, userName, avatarUrl };
  giftCount: number;
  combo?: { comboId, comboCount, isNewCombo };
}
```

---

### 2. **SVGA动画兼容性**

| 注意点 | 说明 |
|--------|------|
| **库选择** | 使用 `svga.lite` (推荐) 或 `svgaplayerweb` |
| **Canvas性能** | 移动端H5需注意Canvas内存，及时销毁 |
| **首次加载** | SVGA文件较大(100KB-1MB)，需要预加载 |
| **降级方案** | 不支持时显示静态礼物图标 + CSS动画 |

```typescript
// 预加载SVGA
const preloadSvga = async (urls: string[]) => {
  const parser = new Parser();
  await Promise.all(urls.map(url => parser.load(url)));
};
```

---

### 3. **乐观更新策略**

APP的关键体验：**发送后立即播放动画，不等服务器响应**

```typescript
const sendGift = async (gift: Gift) => {
  // 1. 本地余额检查
  if (balance < gift.coins) {
    toast.error('钻石不足');
    return;
  }
  
  // 2. 乐观更新 - 立即播放
  const prevBalance = balance;
  setBalance(b => b - gift.coins);
  playGiftAnimation(gift);  // 立即播放
  
  // 3. 后台请求
  try {
    const res = await api.sendGift(gift);
    if (!res.success) throw new Error(res.error);
  } catch (e) {
    // 4. 失败回滚
    setBalance(prevBalance);
    toast.error('发送失败');
  }
};
```

---

### 4. **连击(Combo)处理**

同一用户快速发送相同礼物时合并显示：

```typescript
// 弹幕合并逻辑
const addBullet = (newBullet: GiftBullet) => {
  setBullets(prev => {
    const existing = prev.find(
      b => b.senderName === newBullet.senderName && 
           b.giftName === newBullet.giftName
    );
    if (existing) {
      // 累加数量，重置定时器
      existing.count += newBullet.count;
      existing.timestamp = Date.now();
      return [...prev];
    }
    return [...prev, newBullet].slice(-3); // 最多3条
  });
};
```

---

### 5. **音效播放**

```typescript
// 注意：移动端需用户交互后才能播放音频
const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.5;
  audio.play().catch(() => {
    // 静默失败，不影响体验
  });
};

// 预加载音效
const preloadSounds = (urls: string[]) => {
  urls.forEach(url => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
  });
};
```

---

### 6. **移动端H5特殊处理**

| 问题 | 解决方案 |
|------|----------|
| **软键盘遮挡** | 礼物面板使用 `position: fixed; bottom: 0` |
| **触摸穿透** | 动画层设置 `pointer-events: none` |
| **性能优化** | 减少动画数量，使用 `will-change: transform` |
| **安全区域** | 底部按钮考虑 `env(safe-area-inset-bottom)` |

---

### 7. **关键技术点总结**

1. **API保持一致** - 复用APP的 `/api/gift/send`、`/api/gift/list`
2. **消息格式统一** - 与APP端IM消息结构一致，确保互通
3. **预加载资源** - SVGA动画和音效提前下载
4. **动画队列** - 最多缓存3个，自己发送的优先
5. **余额同步** - 发送成功后更新本地缓存余额
6. **错误处理** - 余额不足、网络错误需友好提示

---

### 8. **推荐开发顺序**

1. ✅ 礼物列表面板（API对接）
2. ✅ 送礼按钮 + 余额显示
3. ✅ 弹幕横幅动画（framer-motion）
4. ✅ SVGA全屏动画
5. ✅ 实时消息接收（WebSocket）
6. ⭐ 连击效果优化
7. ⭐ 豪华飘屏效果

