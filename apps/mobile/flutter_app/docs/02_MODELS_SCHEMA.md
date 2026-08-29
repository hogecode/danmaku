# Flutter DPlayer - データモデル仕様書

---

## 📊 コア データモデル

### 1. DanmakuModel (API用)

```dart
class DanmakuModel {
  final double time;        // コメント時刻(秒)
  final String type;        // 'right'|'top'|'bottom'
  final String color;       // HEXカラー(例: #ffeaea)
  final String author;      // 投稿者名
  final String text;        // コメントテキスト
  final String size;        // 'big'|'medium'|'small'
  final String? id;         // オプションID
}
```

### 2. DanmakuEntity (ドメイン層用)

```dart
class DanmakuEntity {
  final double time;
  final DanmakuType type;   // enum
  final Color color;
  final String author;
  final String text;
  final DanmakuSize size;   // enum
  final String? id;

  // 計算プロパティ
  double get durationSeconds => 8.0;  // 画面表示時間
  double get distancePx => 1000.0;    // 移動距離
}
```

### 3. Enum 定義

```dart
enum DanmakuType {
  right('right'),   // 右→左 流動
  top('top'),       // 上部 固定
  bottom('bottom'); // 下部 固定

  final String value;
  const DanmakuType(this.value);
}

enum DanmakuSize {
  big('big', 32.0),
  medium('medium', 24.0),
  small('small', 16.0);

  final String value;
  final double fontSize;
  const DanmakuSize(this.value, this.fontSize);
}
```

### 4. PlayerState (プレイヤー状態)

```dart
class PlayerState {
  final Duration currentTime;
  final Duration duration;
  final bool isPlaying;
  final bool isFullscreen;
  final double playbackSpeed;
  final double volume;
  final bool isLoading;
  final String? errorMessage;

  // copyWith()メソッド付き
}
```

### 5. DanmakuState (ダンマク状態)

```dart
class DanmakuState {
  final List<DanmakuEntity> danmakuList;
  final bool isLoading;
  final String? errorMessage;
  final double opacity;      // 0.0 ~ 1.0
  final double speedRate;     // 1.0 ~ 3.0
  final bool isVisible;

  // copyWith()メソッド付き
}
```

### 6. ApiResponseModel

```dart
class ApiResponseModel<T> {
  final int code;           // 0 = 成功
  final String? msg;
  final T? data;

  bool get isSuccess => code == 0;
}
```

---

## 🔄 型変換フロー

```
API JSON
   ↓
DanmakuModel (json_serializable)
   ↓
DanmakuEntity (手動変換)
   ↓
Riverpod State
   ↓
UI Widget
```

---

## 📋 DPlayer API互換性

### レスポンス形式

```json
{
  "code": 0,
  "data": [
    [0, "right", "#ffeaea", "Author", "テキスト", "medium"]
  ]
}
```

### 配列フォーマット
`[時間, タイプ, 色, 著者, テキスト, サイズ]`

---

**次のドキュメント**: [03_API_SPECIFICATION.md](./03_API_SPECIFICATION.md)
