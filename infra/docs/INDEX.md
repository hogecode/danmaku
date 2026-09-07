# ドキュメント一覧 (Documentation Index)

このディレクトリには、AWSプロジェクトの包括的なドキュメントが含まれています。

## 📚 ドキュメント構成

### 1. [システムアーキテクチャ](./ARCHITECTURE.md)
システム全体の構成、コンポーネント詳細、ネットワーク設計を説明します。

**対象読者**: すべてのチーム  
**主な内容**:
- システム構成図
- コンポーネント詳細（ECS、RDS、ECR等）
- ネットワーク設計（VPC、セキュリティグループ）
- マルチAZ構成
- 環境別構成（本番・ステージング・開発）

---

### 2. [CI/CDパイプライン](./CI_CD.md)
GitFlow戦略、GitHub Actions、AWS CodePipeline、CodeBuild、CodeDeployの実装について説明します。

**対象読者**: 開発チーム、インフラエンジニア  
**主な内容**:
- GitFlow ブランチ戦略
- GitHub Actions ワークフロー
- AWS CodePipeline 構成
- CodeBuild / CodeDeploy 設定
- デプロイメント手順（開発→本番）
- トラブルシューティング

---

### 3. [セキュリティ設計](./SECURITY.md)
多層防御アーキテクチャ、IAM管理、コンテナセキュリティ、データ保護について説明します。

**対象読者**: インフラエンジニア、セキュリティチーム  
**主な内容**:
- ネットワークセキュリティ（VPC、SG、WAF）
- IAM ロール・ポリシー設計
- ECR セキュリティ設定
- ECS タスク定義セキュリティ
- データ暗号化（RDS、S3、Secrets Manager）
- ロギング・監視・監査
- インシデント対応
- セキュリティベストプラクティス

---

### 4. [運用・監視ガイド](./OPERATIONS.md)
日次運用、モニタリング、オートスケーリング、トラブルシューティング、メンテナンス手順を説明します。

**対象読者**: インフラエンジニア、SRE、オンコール  
**主な内容**:
- 日次運用チェックリスト
- CloudWatch ダッシュボード構成
- CloudWatch Logs Insights クエリ
- オートスケーリング設定
- 手動スケーリング方法
- トラブルシューティング（ECS、RDS、ALB）
- デプロイメント・ロールバック手順
- メンテナンス作業
- コスト最適化

---

### 5. [コスト管理・最適化](./COST_MANAGEMENT.md)
コスト構造、削減戦略、監視方法、環境別コスト管理について説明します。

**対象読者**: 経営層、財務部、インフラエンジニア  
**主な内容**:
- コスト構造分析
- Fargate Spot 活用
- リソースサイジング最適化
- ストレージコスト削減
- データベースコスト最適化
- ネットワークコスト削減
- AWS Cost Explorer 利用
- コスト削減シナリオ

---

### 6. [災害復旧・ビジネス継続性](./DISASTER_RECOVERY.md)
RTO/RPO定義、災害シナリオ別復旧計画、バックアップ戦略、定期訓練について説明します。

**対象読者**: インフラエンジニア、CTO、 BCP担当者  
**主な内容**:
- RTO・RPO 定義
- 災害シナリオ別復旧手順（リージョン停止、DB故障等）
- バックアップ・リストア戦略
- 定期訓練（四半期）
- チェックリスト
- ビジネス影響分析（BIA）

---

## 🎯 ユースケース別ガイド

### 新しいエンジニアがオンボーディングする場合
1. [システムアーキテクチャ](./ARCHITECTURE.md) - 全体像理解
2. [CI/CDパイプライン](./CI_CD.md) - デプロイメント手順
3. [運用・監視ガイド](./OPERATIONS.md) - 日次業務

### デプロイメントを実施する場合
- [CI/CDパイプライン](./CI_CD.md) の **デプロイメント手順** セクション
- [運用・監視ガイド](./OPERATIONS.md) の **デプロイメント実行** セクション

### トラブルシューティング
- [運用・監視ガイド](./OPERATIONS.md) の **トラブルシューティング** セクション

### セキュリティ監査
- [セキュリティ設計](./SECURITY.md) の **セキュリティ監査チェックリスト**

### 災害が発生した場合
- [災害復旧・ビジネス継続性](./DISASTER_RECOVERY.md) の該当シナリオ

### コスト削減を検討する場合
- [コスト管理・最適化](./COST_MANAGEMENT.md)

---

## 📋 各ドキュメントの最終更新日

| ドキュメント | 更新日 | 更新者 | 変更内容 |
|-----------|------|------|--------|
| ARCHITECTURE.md | 2026-04-20 | - | 初版作成 |
| CI_CD.md | 2026-04-20 | - | 初版作成 |
| SECURITY.md | 2026-04-20 | - | 初版作成 |
| OPERATIONS.md | 2026-04-20 | - | 初版作成 |
| COST_MANAGEMENT.md | 2026-04-20 | - | 初版作成 |
| DISASTER_RECOVERY.md | 2026-04-20 | - | 初版作成 |

---

## 📌 重要なリソース

### リポジトリ構成
```
ecs-sample/
├── docs/                           # このディレクトリ
│   ├── INDEX.md                    # このファイル
│   ├── ARCHITECTURE.md             # システムアーキテクチャ
│   ├── CI_CD.md                    # CI/CDパイプライン
│   ├── SECURITY.md                 # セキュリティ設計
│   ├── OPERATIONS.md               # 運用・監視
│   ├── COST_MANAGEMENT.md          # コスト管理
│   └── DISASTER_RECOVERY.md        # 災害復旧
├── terraform/                      # Terraform IaC
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── lambda/                         # Lambda 関数
│   └── src/
├── server/                         # Go サーバー
│   └── main.go
├── web/                            # Next.js フロントエンド
│   └── pages/
├── .github/
│   └── workflows/                  # GitHub Actions
└── README.md                       # プロジェクト概要
```

### 関連ドキュメント
- [README.md](../README.md) - プロジェクト概要
- [.github/workflows/](../.github/workflows/) - CI/CD ワークフロー定義

---

## 🔄 ドキュメント維持手順

### 定期更新スケジュール

| 頻度 | 対象 | 確認者 |
|------|------|--------|
| 毎月 | OPERATIONS.md | インフラリード |
| 四半期 | ARCHITECTURE.md | CTO |
| 四半期 | SECURITY.md | セキュリティリード |
| 四半期 | DISASTER_RECOVERY.md | CTO |
| 半年 | CI_CD.md | リードエンジニア |
| 半年 | COST_MANAGEMENT.md | CFO |

### 更新時の注意事項
1. Markdown 形式を保持
2. 新しい変更内容をテーブルに追記
3. 内容が古くなったセクションは削除/更新
4. 参照リンクの有効性確認
5. コマンド例は実際に動作確認してから更新

---

## 💡 ドキュメント改善への提案

問題点や改善提案がある場合は、GitHub Issues で報告してください：

```bash
# 例: セキュリティドキュメントに誤りがある場合
git issue create --title "SECURITY.md: IAM ロール設定に誤り" \
  --body "SECURITY.md のセクション3に記載されたIAM ロール定義が古い"
```

---

## 📚 参考資料

### AWS 公式ドキュメント
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [AWS Disaster Recovery Solutions](https://aws.amazon.com/disaster-recovery/)

### ベストプラクティス
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon-web-services)
- [The Twelve-Factor App](https://12factor.net/)

### コミュニティリソース
- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [GitFlow Workflow](https://www.atlassian.com/ja/git/tutorials/comparing-workflows/gitflow-workflow)

---

## 📞 質問・サポート

ドキュメントについて質問がある場合は、以下の連絡先にお問い合わせください：

```
インフラ全般:    インフラリード
セキュリティ:    セキュリティリード
CI/CD:          リードエンジニア
コスト最適化:    CFO
災害復旧:       CTO
```

---

**最終確認日**: 2026-04-20  
**次回見直し予定日**: 2026-07-20

---

## 📝 ドキュメント作成者メモ

このドキュメントセットは、AWSプロジェクトの全体像を把握するために必要な情報を網羅しています。各ドキュメントは独立していますが、相互参照されるように設計されています。

新しいチームメンバーがこのドキュメントを読むことで、プロジェクトの：
- アーキテクチャ理解
- セキュリティ要件の認識
- デプロイメント手順の習得
- 運用・監視方法の学習
- コスト最適化の実施
- 災害復旧の準備

が可能になります。

継続的な改善とフィードバックを歓迎します。
