# Flutter DPlayer - ダンマク描画エンジン仕様書

---

## 🎯 概要

CustomPaint を使用した高速ダンマク描画エンジン。
- 60fps フレームレート維持
- 1000+ 同時表示対応

---

## 🏗️ エンジン構成

```
DanmakuCanvas (CustomPaint Widget)
  └─ DanmakuPainter (CustomPainter)
     ├─ DanmakuEngine
     │  ├─ calculateFrame()
     │  ├─ updateParticles()
     │  └─ detectCollision()
     └─ DanmakuParticles[]
```

---

## 📐 座標系・計算式

### Right タイプ（右→左 流動）

**初期位置**: `x = canvasWidth`

**移動式**

```dart
double progress = (currentTime - danmaku.startTime) 
                  / DURATION_SECONDS;

double x = canvasWidth 
         - (progress * (canvasWidth + textWidth));

// 停止時間計算
if (progress >= 1.0) {
  danmaku.isVisible = false;
}
```

**時間定数**

```dart
static const double DURATION_SECONDS = 8.0;    // 8秒
static const double DISTANCE_PX = 1280.0;      // 移動距離
```

**速度計算（speedRate 対応）**

```dart
double velocityPerFrame = 
  (DISTANCE_PX / (DURATION_SECONDS * FPS)) * speedRate;
```

### Top/Bottom タイプ（固定位置）

**位置**

```dart
// Top
y = topMargin + (index * LINE_HEIGHT);

// Bottom
y = canvasHeight - bottomMargin - (index * LINE_HEIGHT);
```

**表示期間**

- `startTime` から `startTime + DURATION_SECONDS` まで表示
- その後フェードアウト（0.5秒）

---

## 🔄 フレーム計算ロジック

### メインループ（60fps）

```dart
void paint(Canvas canvas, Size size) {
  // 1. 現在時刻取得
  double currentTime = _getCurrentTime();
  
  // 2. 粒子位置更新
  _updateAllParticles(currentTime);
  
  // 3. 衝突検出（right タイプのみ）
  _detectAndResolveCollisions();
  
  // 4. 描画順序ソート
  _sortByDepth();
  
  // 5. Canvas 描画
  for (var particle in particles) {
    if (particle.isVisible) {
      _drawParticle(canvas, particle);
    }
  }
}
```

### 粒子更新

```dart
void _updateParticle(DanmakuParticle p, double time) {
  switch (p.type) {
    case DanmakuType.right:
      double elapsed = time - p.startTime;
      if (elapsed < 0) return;
      
      double progress = elapsed / DURATION_SECONDS;
      p.x = canvasWidth - (progress * 
            (canvasWidth + p.width));
      
      if (progress >= 1.0) p.isVisible = false;
      
    case DanmakuType.top:
    case DanmakuType.bottom:
      double elapsed = time - p.startTime;
      if (elapsed < 0 || elapsed > DURATION + 0.5) {
        p.isVisible = false;
      }
  }
}
```

---

## 💥 衝突検出

### アルゴリズム

```dart
void _detectAndResolveCollisions() {
  var rightDanmaku = particles
    .where((p) => p.type == DanmakuType.right 
                && p.isVisible)
    .toList();
  
  for (int i = 0; i < rightDanmaku.length; i++) {
    for (int j = i + 1; j < rightDanmaku.length; j++) {
      if (_isColliding(rightDanmaku[i], 
                       rightDanmaku[j])) {
        _resolveCollision(rightDanmaku[i], 
                         rightDanmaku[j]);
      }
    }
  }
}

bool _isColliding(DanmakuParticle a, 
                  DanmakuParticle b) {
  // 軌道チェック
  if ((a.targetY - b.targetY).abs() > LINE_HEIGHT) 
    return false;
  
  // 距離チェック
  double minDist = a.width + b.width + MARGIN;
  return (a.x - b.x).abs() < minDist;
}
```

---

## 🎨 描画処理

### テキスト描画

```dart
void _drawParticle(Canvas canvas, 
                   DanmakuParticle p) {
  // 1. TextPainter キャッシュ
  TextPainter tp = p.getOrCreateTextPainter();
  
  // 2. 位置設定
  canvas.save();
  canvas.translate(p.x, p.y);
  
  // 3. 不透明度適用
  final paint = Paint()
    ..color = p.color.withOpacity(
      _globalOpacity * p.opacity);
  
  // 4. テキスト描画
  tp.paint(canvas, Offset(0, 0));
  
  canvas.restore();
}
```

---

## ⚡ パフォーマンス最適化

### 1. オブジェクトプール

```dart
class DanmakuParticlePool {
  final List<DanmakuParticle> _pool = [];
  static const int POOL_SIZE = 200;
  
  DanmakuParticle acquire(DanmakuEntity e) {
    final p = _pool.isNotEmpty 
      ? _pool.removeLast() 
      : DanmakuParticle();
    p.reset(e);
    return p;
  }
  
  void release(DanmakuParticle p) {
    if (_pool.length < POOL_SIZE) {
      _pool.add(p);
    }
  }
}
```

### 2. TextPainter キャッシング

```dart
class DanmakuParticle {
  TextPainter? _cachedTP;
  
  TextPainter getOrCreateTextPainter() {
    if (_cachedTP != null) return _cachedTP!;
    
    final span = TextSpan(
      text: text,
      style: TextStyle(
        fontSize: size.fontSize,
        color: color,
      ),
    );
    
    _cachedTP = TextPainter(
      text: span,
      textDirection: TextDirection.ltr,
    );
    _cachedTP!.layout();
    return _cachedTP!;
  }
}
```

### 3. 画面外判定スキップ

```dart
bool shouldRender(DanmakuParticle p, 
                  Size size) {
  if (p.x + p.width < 0 || 
      p.x > size.width) return false;
  if (p.y + p.height < 0 || 
      p.y > size.height) return false;
  return true;
}
```

### 4. RepaintBoundary

```dart
class DanmakuCanvas extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: CustomPaint(
        painter: DanmakuPainter(...),
        size: Size.infinite,
      ),
    );
  }
}
```

---

## 📊 パフォーマンス目標

| 指標 | 目標値 |
|------|--------|
| フレームレート | 60fps |
| 同時表示数 | 1000+ |
| メモリ | < 50MB |
| CPU | < 30% |

---

**次のドキュメント**: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
