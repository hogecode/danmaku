# DPlayer vs React Native ダンマク実装 - 違い分析

## 📊 概観

| 項目 | DPlayer (Web - HTML/Canvas/TypeScript) | React Native (モバイル) |
|------|------|------|
| **描画方式** | DOM + CSS Animation | Animated API (React Native) |
| **フレーム制御** | `requestAnimationFrame()` ループ | ポーリング（100ms間隔） |
| **コメント管理** | トンネル（danTunnel）+ DOM 直接操作 | React State + Ref |
| **重複排除** | `danIndex` で一方向イテレーション | 全コメント ID セット追跡 |
| **トラック管理** | 衝突検知 + 動的トンネル割当 | 固定トラック高さ × 計算 |
| **アニメーション** | CSS keyframes（`translateX`） | Animated.timing() |

---

## 🔄 フロー比較

### DPlayer: frame() ループ (requestAnimationFrame)

```typescript
frame(): void {
  if (this.dan.length && !this.paused && this.showing) {
    let item = this.dan[this.danIndex];
    const dan = [];
    
    // ⭐ 重要：currentTime より前のコメントを集める
    while (item && this.options.time() > parseFloat(item.time)) {
      dan.push(item);
      item = this.dan[++this.danIndex];  // インデックスを進める
    }
    
    this.draw(dan);  // 一括描画
  }
  
  // ⭐ 毎フレーム呼び出し（60 FPS）
  window.requestAnimationFrame(() => {
    this.frame();
  });
}
```

**特徴：**
- `danIndex` 単方向カウンタ（すでに処理したコメントはスキップ）
- `while` で時刻条件に合うコメント全て集める
- ✅ 毎フレーム呼ばれるので重複なし

### React Native: useMemo + useEffect

```typescript
const visibleDanmakus = useMemo(() => {
  const timeWindow = 4 / speedRate;
  const filteredList = danmakuList.filter(dan => {
    return dan.time >= currentTime - timeWindow && 
           dan.time <= currentTime + timeWindow;
  });

  // ⭐ ID セットで重複排除
  return filteredList.filter(dan => {
    const id = getCommentId(dan);
    return !displayedIdsRef.current.has(id);
  });
}, [danmakuList, currentTime, speedRate]);
```

**問題：**
- 毎フレーム全コメント再スキャン
- currentTime の精度に依存 → 間のコメントをスキップ可能

---

## ⚠️ 致命的な違い

### 1. **時刻精度 - ポーリング遅延**

**DPlayer:**
- `requestAnimationFrame` = 60 FPS（16ms 間隔）
- `currentTime` が常に監視される

**React Native:**
```typescript
const interval = setInterval(() => {
  const currentTime = player.currentTime || 0;
  updateTime(currentTime);
}, 100);  // ❌ 100ms = 10 FPS！
```

- 100ms ごと = 秒当たり 10 回
- `0 → 0.1 → 0.2 → ...` の場合、
- コメント時刻 0.05 秒のものが **スキップされる！**

### 2. **danIndex vs ID Set**

**DPlayer:**
```typescript
let item = this.dan[this.danIndex];
while (item && this.options.time() > parseFloat(item.time)) {
  dan.push(item);
  item = this.dan[++this.danIndex];  // ← ポイント
}
```
- 一度処理した `danIndex` より前には戻らない
- **時刻ジャンプしても全コメント処理される**

**React Native:**
```typescript
const filteredList = danmakuList.filter(dan => {
  return dan.time >= currentTime - timeWindow && 
         dan.time <= currentTime + timeWindow;
});
```
- 毎回全リスト再スキャン
- 時刻ウィンドウ `[currentTime - 4, currentTime + 4]` 外は捨てられる
- **ポーリング 100ms で時刻ジャンプ → コメント消失**

---

## 🔧 修正案

### 推奨：高頻度ポーリング + danIndex 導入

```typescript
// VideoPlayer.tsx で 10ms ポーリング
useEffect(() => {
  if (!player) return;

  const interval = setInterval(() => {
    try {
      const currentTime = player.currentTime || 0;
      const duration = player.duration || 0;

      updateTime(currentTime);  // ✅ 高頻度更新
      if (duration > 0) {
        setDuration(duration);
      }
    } catch (e) {
      // ignore
    }
  }, 10);  // ✅ 100ms → 10ms に短縮（100 FPS ライク）

  return () => {
    clearInterval(interval);
  };
}, [player, updateTime, setDuration]);
```

### Player.tsx で danIndex 導入

```typescript
const danmakuIndexRef = useRef(0);

useEffect(() => {
  if (!visible || paused) return;

  // ⭐ DPlayer ライク：displayTime 以上のコメントを一括取得
  const dan: Danmaku[] = [];
  let item = danmakuAnimation.danmakuList[danmakuIndexRef.current];

  while (item && displayTime > item.time) {
    dan.push(item);
    danmakuIndexRef.current++;
    item = danmakuAnimation.danmakuList[danmakuIndexRef.current];
  }

  // 新規コメントをアニメーション開始
  if (dan.length > 0) {
    danmakuAnimation.addDanmaku(dan);  // 既に addDanmaku で重複排除
  }
}, [displayTime, visible, paused, danmakuAnimation]);
```

---

## 📌 まとめ

| 問題 | 原因 | DPlayer での解決 | React Native 修正 |
|------|------|------|------|
| **最初だけ流れる** | ポーリング遅延 + 時刻ウィンドウ | 毎フレーム呼ぶ | 100ms → 10ms |
| **コメント消失** | 時刻ジャンプ → スキップ | `danIndex` 一方向 | `danIndex` Ref 導入 |
| **トラック位置ズレ** | Y 座標計算の精度 | 衝突検知 | ✅ 現在の実装で OK |
| **重複表示** | ID 追跡漏れ | `danIndex` で自動防止 | ✅ Set 追跡で OK |

**結論：ポーリング間隔の改善が最優先！**

