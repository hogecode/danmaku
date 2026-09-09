# React Native ビデオプレイヤー

DPlayer を参考に実装した React Native 用のビデオプレイヤーコンポーネント。
ビデオ再生、ダンマク（弾幕/コメント）表示・管理機能を備えています。

## ディレクトリ構成

```
player/
├── components/          # UI コンポーネント
│   ├── VideoPlayer.tsx  # ビデオプレイヤー本体
│   ├── DanmakuDisplay.tsx   # ダンマク表示層
│   ├── DanmakuForm.tsx      # ダンマク送信フォーム
│   └── index.ts
├── hooks/              # カスタムフック
│   ├── useVideoPlayback.ts  # ビデオ再生制御
│   ├── useDanmakuAnimation.ts   # ダンマク管理
│   └── index.ts
├── types/              # 型定義
│   └── index.ts
├── Player.tsx          # 統合プレイヤー
├── index.ts            # 公開インターフェース
└── README.md
```

## 主要機能

### 1. ビデオ再生 (`VideoPlayer`)

- react-native-video を使用した動画再生
- 再生/一時停止、シーク、音量調整
- ローディング・エラー表示
- 再生時間・プログレスバー表示

### 2. ダンマク表示 (`DanmakuDisplay`)

- DPlayer のダンマク実装を参考
- 3 種類のコメント表示タイプ：
  - `normal`: 右から左へスクロール
  - `top`: 画面上部に固定
  - `bottom`: 画面下部に固定
- Animated API を使用したスムーズなアニメーション
- カスタマイズ可能な速度・フォントサイズ・透明度

### 3. コメント管理 (`useDanmakuAnimation`)

DPlayer の `danmaku.ts` を参考に実装：

- **トンネル管理**: 複数のコメントが同じ行に表示されないように管理
- **無制限表示モード**: 画面を越えてコメントを表示可能
- **時間範囲フィルタリング**: 現在時刻の前後のコメントのみ表示
- **文字幅測定**: Canvas API で正確な文字幅を計算
- **シーク対応**: 動画をシークしたときにコメント位置をリセット

### 4. コメント送信 (`DanmakuForm`)

- テキスト入力
- コメント種類選択（スクロール/上部/下部）
- 色選択（7 色から選択可能）
- モーダルダイアログで実装

## 使用方法

### 基本的な使用例

```typescript
import { Player } from '@/components/player';
import type { PlayerConfig } from '@/components/player';

const config: PlayerConfig = {
  container: containerRef,
  video: {
    url: 'https://example.com/video.mp4',
    type: 'normal',
    pic: 'https://example.com/thumbnail.jpg',
  },
  autoplay: true,
  danmaku: {
    speedRate: 1,
    fontSize: 16,
    opacity: 0.8,
    unlimited: false,
  },
  apiBackend: {
    read: ({ success, error }) => {
      // コメントを取得
      fetch('/api/comments')
        .then(r => r.json())
        .then(data => success(data.comments))
        .catch(err => error(err.message));
    },
    send: ({ comment, success, error }) => {
      // コメントを送信
      fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify(comment),
      })
        .then(() => success())
        .catch(err => error(err.message));
    },
  },
};

export function PlayerScreen() {
  return (
    <Player
      config={config}
      onReady={() => console.log('Player ready')}
      onError={(err) => console.error(err)}
      onDanmakuSend={(danmaku) => console.log('Danmaku sent:', danmaku)}
    />
  );
}
```

## 型定義

### `PlayerConfig`

```typescript
interface PlayerConfig {
  container: any;
  video: {
    url: string;
    type: 'normal' | 'hls' | 'flv' | 'dash';
    pic?: string;
    duration?: number;
  };
  autoplay?: boolean;
  danmaku?: DanmakuConfig;
  apiBackend?: APIBackendConfig;
  // その他オプション...
}
```

### `Danmaku`

```typescript
interface Danmaku {
  time: number;                     // 表示開始時刻（秒）
  type: 'normal' | 'top' | 'bottom'; // 表示タイプ
  color: string;                    // 色（#RRGGBB）
  author: string;                   // 投稿者
  text: string;                     // テキスト
  size?: 'normal' | 'small' | 'large';
  fontSize?: number;
}
```

## DPlayer との違い

### Web版との互換性

このコンポーネントは、DPlayer の TypeScript 版（`@dplayer-master/src/ts/`）を参考に実装されていますが、React Native 環境に合わせて調整されています。

#### 主な違い

1. **DOM API の非使用**
   - Web版は DOM 直接操作（`.innerHTML`, `classList` など）
   - React Native版は Animated API を使用

2. **アニメーション実装**
   - Web版: CSS Keyframes
   - React Native版: Animated API

3. **イベント処理**
   - Web版: DOM イベント（click, keydown など）
   - React Native版: React Native のイベント（onPress など）

4. **スタイリング**
   - Web版: CSS
   - React Native版: Tailwind CSS + inline styles

## パフォーマンス最適化

- **メモ化**: `useCallback` で関数の再作成を避ける
- **状態分離**: アニメーションと静的データを分離管理
- **レンダリング最適化**: 必要な部分のみ更新

## サポートされるコメント形式

- ニコニコ実況形式（XML）
- JSON 形式

（内部的には Danmaku インターフェースに統一）

## 今後の改善予定

- [ ] サムネイル表示
- [ ] 多言語対応
- [ ] キーボードショートカット
- [ ] ホットキー機能
- [ ] 字幕表示
- [ ] 設定パネル
