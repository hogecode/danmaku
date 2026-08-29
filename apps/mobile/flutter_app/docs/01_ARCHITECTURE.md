# Flutter DPlayer - アーキテクチャ設計書

---

## 📐 システムアーキテクチャ

### レイヤー構成（Clean Architecture）

```
Presentation Layer (Pages, Widgets, Providers)
        ↓
Domain Layer (Entities, UseCases, Business Logic)
        ↓
Data Layer (Repositories, Models, DataSources)
        ↓
External Services (API, Storage, Device APIs)
```

---

## 🔄 データフロー

### ダンマク取得フロー

```
User Action
    ↓
PlayerPage triggers fetch
    ↓
DanmakuNotifier.fetchDanmaku()
    ↓
FetchDanmakuUseCase.execute(videoId)
    ↓
DanmakuRepository.getDanmaku(videoId)
    ↓
RemoteDataSource.fetchDanmaku(url)
    ↓
ApiService.get("/api/danmaku")
    ↓
HTTP Response (JSON)
    ↓
Parse to DanmakuModel[]
    ↓
Convert to DanmakuEntity
    ↓
Update State (Riverpod)
    ↓
Widget rebuild + DanmakuCanvas render
```

### リアルタイム描画フロー

```
AnimationController (60fps)
    ↓
DanmakuCanvas.paint()
    ↓
DanmakuEngine.calculateFrame()
    ↓
For each DanmakuParticle:
  ├─ Update position
  ├─ Calculate text bounds
  ├─ Detect collision
  ├─ Draw to Canvas
    ↓
RepaintBoundary refresh (16.67ms)
```

---

## 🎨 Riverpod State Management

### Provider 階層

```
1. Service Providers
   ├─ apiServiceProvider
   ├─ storageServiceProvider
   └─ danmakuEngineProvider

2. Repository Providers
   └─ danmakuRepositoryProvider

3. UseCase Providers
   ├─ fetchDanmakuUseCaseProvider
   └─ updateDanmakuUseCaseProvider

4. State Providers (StateNotifier)
   ├─ playerStateProvider
   ├─ danmakuStateProvider
   └─ uiStateProvider

5. Computed Providers (selector)
   ├─ visibleDanmakuProvider
   ├─ playerOpacityProvider
   └─ currentPlayerTimeProvider
```

---

## 🗂️ ディレクトリ構成（簡略版）

```
lib/
├── core/                    # コア層
│   ├── constants/
│   ├── config/
│   ├── extensions/
│   └── utils/
├── data/                    # データ層
│   ├── datasources/
│   ├── models/
│   ├── repositories/
│   └── services/
├── domain/                  # ドメイン層
│   ├── entities/
│   └── usecases/
├── presentation/            # プレゼンテーション層
│   ├── providers/
│   ├── notifiers/
│   ├── pages/
│   └── widgets/
└── main.dart
```

---

## 🔌 外部系との接点

### API インテグレーション
- Dio (HTTP Client) → ApiService → RemoteDataSource

### ローカルストレージ
- Hive (Key-Value Store) → LocalDataSource → キャッシング

### ビデオ再生
- VideoPlayerController → PlayerNotifier → UI

---

**次のドキュメント**: [02_MODELS_SCHEMA.md](./02_MODELS_SCHEMA.md)
