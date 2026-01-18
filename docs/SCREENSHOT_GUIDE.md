# スクリーンショット画像の作成・取得方法

GitHub Pagesの各プロジェクトページのスクリーンショット画像を作成・取得する方法です。

## 📸 方法1: 手動でスクリーンショットを撮影（推奨）

### 手順

1. **各プロジェクトのGitHub Pagesサイトにアクセス**
   - 例: `https://kwu-cms.github.io/cms-exercise-newmedia-2025`

2. **スクリーンショットを撮影**
   - Mac: `Cmd + Shift + 4` で範囲選択
   - Windows: `Win + Shift + S` で範囲選択
   - または、ブラウザの拡張機能を使用

3. **画像をリポジトリに配置**
   - 各プロジェクトのリポジトリのルートに配置
   - ファイル名: `screenshot.png` または `og-image.png`
   - 推奨サイズ: 1200x630px（OGP画像の標準サイズ）

### 配置場所

各プロジェクトのリポジトリのルートディレクトリに配置：

```
プロジェクトリポジトリ/
├── index.html
├── screenshot.png  ← ここに配置
└── ...
```

または、`images`フォルダに配置：

```
プロジェクトリポジトリ/
├── index.html
└── images/
    └── screenshot.png  ← ここに配置
```

## 🤖 方法2: 自動スクリーンショットサービスを使用

### URL2PNG / ScreenshotAPI などのサービス

1. **ScreenshotAPI** (https://screenshotapi.net/)
   - APIを使用して自動的にスクリーンショットを取得
   - 無料プランあり

2. **htmlcsstoimage.com**
   - HTML/CSSから画像を生成
   - API対応

3. **GitHub Actionsで自動生成**
   - 各プロジェクトのリポジトリにGitHub Actionsを設定
   - デプロイ時に自動的にスクリーンショットを生成

### GitHub Actionsの例

各プロジェクトのリポジトリに `.github/workflows/screenshot.yml` を作成：

```yaml
name: Generate Screenshot

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  screenshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate screenshot
        uses: browserless/chrome-action@v1
        with:
          url: https://kwu-cms.github.io/${{ github.event.repository.name }}
          output: screenshot.png
      - name: Commit screenshot
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add screenshot.png
          git commit -m "Update screenshot" || exit 0
          git push
```

## 🎨 方法3: OGP画像を自動生成

### 各プロジェクトページでOGP画像を生成

各プロジェクトのHTMLにOGPメタタグを追加し、画像を自動生成：

```html
<meta property="og:image" content="https://kwu-cms.github.io/プロジェクト名/og-image.png">
```

### OGP画像生成サービス

1. **og-image.vercel.app** のようなサービスを使用
2. **各プロジェクトでOGP画像を生成するスクリプトを作成**

## 📋 方法4: 各プロジェクトにREADME画像を配置

多くのプロジェクトでは、README.mdに画像を配置しています。その画像をスクリーンショットとして使用できます。

### README画像のパス

```
プロジェクトリポジトリ/
├── README.md
└── images/
    └── screenshot.png  ← READMEで使用している画像
```

この画像をスクリーンショットとして使用する場合、コードを修正してREADME画像のパスも検索するようにできます。

## 🔧 現在のコードの動作

現在のコードは、以下のパスを順番に試行します：

1. `/og-image.png`
2. `/screenshot.png`
3. `/preview.png`
4. `/images/og-image.png`
5. `/images/screenshot.png`

最初に見つかった画像が表示されます。

## 💡 推奨される方法

### 短期間で実装する場合

1. **手動でスクリーンショットを撮影**（方法1）
2. 各プロジェクトのリポジトリのルートに `screenshot.png` として配置
3. コミット・プッシュ

### 長期的に自動化する場合

1. **GitHub Actionsで自動生成**（方法2）
2. 各プロジェクトのリポジトリにワークフローを設定
3. デプロイ時に自動的にスクリーンショットを生成・更新

## 📝 画像の推奨仕様

- **サイズ**: 1200x630px（OGP画像の標準サイズ）
- **形式**: PNG または JPG
- **ファイルサイズ**: 1MB以下（読み込み速度のため）
- **アスペクト比**: 約1.91:1（横長）

## 🎯 次のステップ

1. 各プロジェクトのスクリーンショットを撮影
2. 各プロジェクトのリポジトリに配置
3. まとめページで自動的に表示される

スクリーンショットがない場合でも、説明があればカードは表示されます（画像なしで）。
