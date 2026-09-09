# React Native ビデオプレイヤー実装概要

## 概要

DPlayer のソースコード（`@dplayer-master/src/ts/`）を参考に、React Native 用のビデオプレイヤーコンポーネントを実装しました。

## 実装ファイル構成

```
src/components/player/
├── types/index.ts                          # 型定義
├── hooks/
│   ├── useVideoPlayback.ts                 # ビデオ再生制御
│   ├── useDanmakuAnimation.ts              # ダンマク管理
│   └── index.ts
├── components/
│   ├── VideoPlayer.tsx                     # プレイヤー本体
│   ├── DanmakuDisplay.tsx                  # ダンマク表示層
│   ├── DanmakuForm.tsx                     # コメント送信フォーム
│   └── index.ts
├── Player.tsx                              # 統合プレイヤー
├── index.ts                                # 公開インターフェース
├── README.md                               # 詳細ドキュメント
└── examples/basic-usage.tsx                # 使用例
```

## 主要な実装内容

### 1. 型定義（types/index.ts）

DPlayer の型システムを React Native に対応させた：

- PlayerConfig: プレイヤー設定
- Danmaku: コメント構造
- DanmakuConfig: コメント表示設定
- APIBackendConfig: バックエンド設定
- PlayerState: 状態管理

### 2. useVideoPlayback フック

DPlayer の機能を React Hooks で実装。
ビデオ再生制御、状態管理、イベント処理を担当。

### 3. useDanmakuAnimation フック

DPlayer の `danmaku.ts` をベースに実装。

**主要な機能**:
- トンネル管理（衝突判定）
- アニメーション時間計算
- テキスト幅測定
- シーク処理
- 表示/非表示切り替え

### 4. VideoPlayer コンポーネント

react-native-video を使用した基本プレイヤー。
再生/一時停止、シーク、音量調整などを実装。

### 5. DanmakuDisplay コンポーネント

DPlayer のダンマク表示を React Native で実装。

**3 種類の表示タイプ**:
- normal: 右から左へスクロール
- top: 画面上部に固定
- bottom: 画面下部に固定

Animated API を使用したスムーズなアニメーション。

### 6. DanmakuForm コンポーネント

コメント送信フォーム。
テキスト入力、種類・色選択、モーダルダイアログ。

### 7. Player コンポーネント

すべてを統合したメインコンポーネント。

## DPlayer との対応

| 機能 | DPlayer | React Native版 |
|-----|---------|----------------|
| コメント読み込み | load() | apiBackend.read() |
| コメント描画 | draw() | DanmakuDisplay |
| トンネル管理 | danTunnel | useDanmakuAnimation |
| アニメーション | _danAnimation() | getAnimationDuration() |
| テキスト測定 | _measure() | measureText() |
| シーク | seek() | seek() |
| 一時停止/再生 | pause()/play() | pause()/play() |

## 主な違い

| 項目 | DPlayer（Web） | React Native版 |
|-----|--------------|-----------------|
| DOM API | 使用 | 非使用（Animated） |
| イベント | DOM events | React Native events |
| スタイリング | CSS | Tailwind CSS |
| ビデオ再生 | HTMLVideoElement | react-native-video |
| アニメーション | CSS Keyframes | Animated API |
| 状態管理 | クラス | React Hooks |
