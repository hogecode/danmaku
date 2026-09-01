# CLAUDE.md - Danmaku Video Player App コード規約

## プロジェクト概要
Google Drive ビデオプレイヤー + リアルタイムコメント表示
- **Backend**: NestJS + TypeScript + Drizzle + Redis
- **Web**: Next.js 16 + React 19 + TypeScript + Tailwind + DPlayer
- **Mobile**: Flutter + Dart + Riverpod + 自作動画プレイヤー

---

## Backend (server/) - NestJS


---

## Frontend (apps/web/) - Next.js

- APIクライアントはopenapi自動生成コードを使用する
  - fetchやaxiosは禁止

---


## Mobile (apps/mobile/flutter_app/) - Flutter


### クリーンアーキテクチャ
```
lib/
├── core/       # テーマ・i18n・定数
├── data/       # API・ローカルストレージ
├── domain/     # ビジネスロジック
└── presentation/ # UI・プロバイダー
```


## コメントXML形式(ニコ実況形式)
JSONも同様にコメントデータを表現できる

```xml
<?xml version="1.0" encoding="utf-8"?>
<packet>
  <chat thread="1492023606" no="19886" vpos="0" date="1492100460" mail="184" user_id="SlF_cF2J1CdotJTaojvbM9mDYAE" premium="1" anonymity="1">てか無料期間中に見れば無料やん</chat>
  <chat thread="1492023606" no="19883" vpos="6" date="1492100460" mail="184 big ue" user_id="OivGSHjEe7qNCpVDcOz9nmm42cI" anonymity="1">３０秒前</chat>
</packet>
```
