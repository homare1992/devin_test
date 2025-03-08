# 乳児活動記録分析・可視化Webアプリ - 技術コンテキスト

## 使用技術

### フロントエンド

- **フレームワーク**: React 18
- **状態管理**: React Hooks (useState, useEffect)
- **UIライブラリ**: Material-UI v5 (@mui/material)
- **データ可視化**: Recharts
- **HTTP通信**: Axios
- **ルーティング**: React Router Dom v6
- **スタイリング**: CSS-in-JS (@emotion/react, @emotion/styled)
- **日付操作**: date-fns

### バックエンド

- **フレームワーク**: Flask (Python)
- **API**: RESTful API
- **CORS対応**: Flask-CORS
- **JSON処理**: jsonify

### データ処理

- **言語**: Python
- **データ分析**: pandas, numpy, scipy
- **テキスト処理**: re (正規表現)
- **データ構造化**: カスタムパーサー

## 開発環境

### 必要なソフトウェア

- **Node.js**: v16.x以上（フロントエンド開発用）
- **Python**: v3.8以上（バックエンドおよびデータ処理用）
- **npm**: パッケージ管理
- **Git**: バージョン管理

### 推奨エディタ/IDE

- Visual Studio Code
  - 推奨拡張機能:
    - ESLint
    - Prettier
    - Python
    - React Developer Tools

## プロジェクト構造

```
project_demo/
├── frontend/                  # Reactフロントエンド
│   ├── public/                # 静的ファイル
│   └── src/                   # ソースコード
│       ├── components/        # UIコンポーネント
│       │   ├── charts/        # チャートコンポーネント
│       │   ├── common/        # 共通コンポーネント
│       │   └── layout/        # レイアウトコンポーネント
│       ├── pages/             # ページコンポーネント
│       ├── services/          # APIサービス
│       └── utils/             # ユーティリティ関数
├── backend/                   # Flaskバックエンド
│   ├── app.py                 # メインアプリケーション
│   ├── config.py              # 設定ファイル
│   └── routes/                # APIルート
├── data_processing/           # データ処理モジュール
│   ├── parser.py              # テキストパーサー
│   ├── analyzer.py            # データ分析
│   └── utils.py               # ユーティリティ関数
└── input/                     # 入力データファイル
```

## 主要コンポーネント

### フロントエンドコンポーネント

- **レイアウトコンポーネント**:
  - Header: アプリケーションヘッダー
  - Sidebar: ナビゲーションサイドバー
  - Footer: アプリケーションフッター

- **共通コンポーネント**:
  - LoadingIndicator: ローディング表示
  - ErrorMessage: エラーメッセージ表示
  - PageSection: ページセクションコンテナ
  - DataCard: データ表示カード

- **チャートコンポーネント**:
  - TimeSeriesChart: 時系列データ表示
  - BarChart: 棒グラフ表示
  - HeatMapChart: ヒートマップ表示
  - ScatterChart: 散布図表示

- **ページコンポーネント**:
  - Dashboard: 全体概要ダッシュボード
  - DataUpload: データアップロード
  - SleepAnalysis: 睡眠分析
  - FeedingAnalysis: 食事分析
  - VomitAnalysis: 吐き戻し分析
  - GrowthAnalysis: 成長分析
  - NotFound: 404ページ

### バックエンドAPI

- **ヘルスチェック**: `/api/health`
- **データ処理**: `/api/parse`, `/api/analyze`, `/api/process`
- **データ取得**: `/api/events`, `/api/summary/daily`, `/api/growth`
- **分析結果取得**: `/api/analysis/*`

## 開発ワークフロー

1. **データ処理モジュールの開発**
   - テキストファイルのパース処理実装
   - データ分析機能の実装
   - 単体テスト

2. **バックエンドの開発**
   - APIエンドポイントの実装
   - データ処理モジュールとの統合
   - APIテスト

3. **フロントエンドの開発**
   - コンポーネント実装
   - APIとの連携
   - UIテスト

## デプロイ

### 開発環境

- **フロントエンド**: `npm start` (開発サーバー)
- **バックエンド**: `flask run` (開発サーバー)

### 本番環境

- **フロントエンド**: 静的ファイルとしてビルド (`npm run build`)
- **バックエンド**: WSGI サーバー (Gunicorn など) を使用

## 技術的制約

- **ブラウザ互換性**: 最新のChrome, Firefox, Safari, Edgeをサポート
- **レスポンシブデザイン**: モバイルからデスクトップまでの様々な画面サイズに対応
- **アクセシビリティ**: WCAG 2.1 AAレベルの準拠を目指す

## パフォーマンス考慮事項

- **データ処理**: 大量のイベントデータを効率的に処理するための最適化
- **API応答時間**: 複雑な分析でも応答時間を最小限に抑える
- **フロントエンドのレンダリング**: 大量のデータを表示する際のパフォーマンス最適化
- **メモリ使用量**: 大規模データセットの処理時のメモリ管理
