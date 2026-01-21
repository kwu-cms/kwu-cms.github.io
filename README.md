# KWU CMS Projects - GitHub Pagesまとめサイト

このリポジトリは、kwu-cms組織のGitHub Pagesで公開されているプロジェクトをまとめて表示するサイトです。

## 機能

- **自動リポジトリ取得**: GitHub APIを使用してkwu-cms組織のリポジトリ一覧を自動取得
- **検索機能**: リポジトリ名や説明文でリアルタイム検索
- **言語フィルタ**: プログラミング言語でフィルタリング
- **ソート機能**: 更新日時、名前、スター数でソート
- **統計情報**: 表示中のリポジトリ数を表示
- **リポジトリ情報**: 各リポジトリの説明、言語、スター数、更新日を表示
- **リンク提供**: GitHubリポジトリとGitHub Pagesへのリンク
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応
- **モダンなUI**: カード形式の美しいデザイン

## リポジトリ名の選択

このサイトを公開するためのリポジトリ名として、以下の選択肢があります：

### 推奨: `kwu-cms.github.io`

**メリット:**

- 組織のトップレベルページとして機能（`https://kwu-cms.github.io` でアクセス可能）
- 最もシンプルで覚えやすいURL
- GitHub Pagesの標準的な命名規則に準拠
- SEO的にも有利

**デメリット:**

- 組織のメインページとして使うため、他の用途には使えない

### その他の選択肢

| リポジトリ名 | URL | 用途・特徴 |
|---|---|---|
| `projects` | `https://kwu-cms.github.io/projects` | プロジェクト一覧専用ページとして明確 |
| `projects-gallery` | `https://kwu-cms.github.io/projects-gallery` | ギャラリー形式であることを明示 |
| `repo-portal` | `https://kwu-cms.github.io/repo-portal` | リポジトリポータルとしての役割を明確化 |
| `repo-listing` | `https://kwu-cms.github.io/repo-listing` | リスト表示であることを明示 |
| `home` | `https://kwu-cms.github.io/home` | ホームページとしての位置づけ |
| `homepage` | `https://kwu-cms.github.io/homepage` | ホームページとしての位置づけ（より明確） |

**注意:** `kwu-cms.github.io` 以外の名前を選ぶ場合、URLは `https://kwu-cms.github.io/{リポジトリ名}` の形式になります。

## セットアップ

詳細なセットアップ手順は [docs/DEPLOY.md](docs/DEPLOY.md) を参照してください。

### クイックスタート

1. **リポジトリの作成**: GitHubで `kwu-cms.github.io` リポジトリを作成
2. **ファイルのアップロード**: ファイルをGitHubにプッシュ（[docs/PUSH_COMMANDS.md](docs/PUSH_COMMANDS.md) 参照）
3. **GitHub Pagesの有効化**: Settings → Pages で公開設定

数分後、`https://kwu-cms.github.io` でサイトにアクセスできるようになります。

## カスタマイズ

### アカウント名の変更

`script.js` の `ACCOUNT_NAME` 定数を変更してください：

```javascript
const ACCOUNT_NAME = 'your-account-name'; // ユーザーアカウントまたは組織名
```

**注意:**

- ユーザーアカウントと組織アカウントの両方に対応しています
- アカウントタイプは自動的に検出されます（`ACCOUNT_TYPE = 'auto'`）
- 手動で指定する場合は `'user'` または `'org'` を設定できます

### スタイルの変更

`styles.css` のCSS変数を変更することで、色やデザインをカスタマイズできます：

```css
:root {
    --primary-color: #2d3748;
    --accent-color: #3182ce;
    /* ... */
}
```

## リポジトリの説明を追加する方法

カードに表示される「説明なし」を変更するには、GitHubリポジトリの説明を設定してください：

1. GitHubリポジトリのページにアクセス
2. リポジトリ名の下にある「⚙️ Settings」アイコンをクリック
3. 「Description」欄に説明を入力
4. 「Save」をクリック

説明を設定すると、カードに表示されます。また、説明がある場合はスクリーンショット画像も表示されます。

### スクリーンショット画像の配置

スクリーンショット画像を表示するには、以下のいずれかのパスに画像を配置してください：

**GitHub Pagesサイトに配置:**

- `/og-image.png`
- `/screenshot.png`
- `/preview.png`
- `/images/og-image.png`
- `/images/screenshot.png`

**GitHubリポジトリに配置（推奨）:**

- リポジトリのルートに `screenshot.png` または `og-image.png` を配置
- または `images/` フォルダに配置

最初に見つかった画像が表示されます。

**詳細な手順は `SCREENSHOT_GUIDE.md` を参照してください。**

## 新しいリポジトリを追加する方法

新しいGitHub Pagesリポジトリをサイトに追加する場合は、以下の手順を実行してください：

### 1. カスタム説明を追加

`custom-descriptions.json` に新しいリポジトリの説明を追加します：

```json
{
  "descriptions": {
    "リポジトリ名": "リポジトリの説明文"
  }
}
```

**説明文のフォーマット例：**
- `"2年次開講の学科必修科目「メディア表現発展演習Ⅰ」の4/13回で実施した「ルールに基づいて絵を描く」の学生作品を紹介するウェブページ"`
- `"授業「プログラミングB（2025）」の成果を紹介するウェブページ"`
- `"授業「フィジカルコンピューティングB」の課題として制作された、ノーコードアプリ「Glide」を用いたスマートフォンアプリを紹介するウェブページ"`

### 2. スクリーンショットマッピングを追加

`script.js` の `initScreenshotMap()` 関数内の `screenshotFiles` 配列に新しいスクリーンショットファイル名を追加します：

```javascript
const screenshotFiles = [
    '既存のファイル名.png',
    '新しいリポジトリ名.png'  // 追加
];
```

### 3. スクリーンショットを生成

Pythonスクリプトを使用してスクリーンショットを自動生成します：

```bash
cd scripts
python3 generate_screenshots.py --repo リポジトリ名 --skip-check --force
```

**注意：** 初回実行時は、Playwrightのブラウザをインストールする必要があります：

```bash
playwright install chromium
```

または、Pythonから自動インストールを試みます（時間がかかる場合があります）。

スクリーンショットは `screenshots/リポジトリ名.png` として保存されます。

### 4. リポジトリ情報を更新

GitHub APIから最新のリポジトリ情報を取得して `repositories.json` を更新します：

```bash
cd scripts
python3 fetch_repositories.py
```

これにより、新しく追加されたリポジトリが `repositories.json` に含まれます。

### 5. 変更をコミット・プッシュ

すべての変更をGitにコミットしてプッシュします：

```bash
git add custom-descriptions.json script.js screenshots/リポジトリ名.png repositories.json
git commit -m "リポジトリ名を追加"
git push
```

### まとめ

新しいリポジトリを追加する際の手順：

1. ✅ `custom-descriptions.json` に説明を追加
2. ✅ `script.js` のスクリーンショットマッピングに追加
3. ✅ スクリーンショットを生成（`generate_screenshots.py`）
4. ✅ リポジトリ情報を更新（`fetch_repositories.py`）
5. ✅ 変更をコミット・プッシュ

**重要：** `repositories.json` を更新しないと、新しいリポジトリが表示されません。GitHub APIから最新情報を取得するため、必ず `fetch_repositories.py` を実行してください。

## 📚 ドキュメント

詳細なドキュメントは `docs/` フォルダにあります：

- **[DEPLOY.md](docs/DEPLOY.md)** - デプロイ手順
- **[PUSH_COMMANDS.md](docs/PUSH_COMMANDS.md)** - GitHubへのプッシュ手順
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** - 認証エラーの解決方法
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - トラブルシューティングガイド
- **[CHECK_ORGANIZATION.md](docs/CHECK_ORGANIZATION.md)** - 組織名の確認方法
- **[CACHE_CLEAR.md](docs/CACHE_CLEAR.md)** - キャッシュクリア方法
- **[REPOSITORY_NAMES.md](docs/REPOSITORY_NAMES.md)** - リポジトリ名の候補リスト
- **[SCREENSHOT_GUIDE.md](docs/SCREENSHOT_GUIDE.md)** - スクリーンショット画像の作成方法
- **[SCREENSHOT_SCRIPT_README.md](docs/SCREENSHOT_SCRIPT_README.md)** - スクリーンショット自動生成スクリプトの使い方

## 注意事項

- GitHub APIにはレート制限があります（認証なしで1時間あたり60リクエスト）
- リポジトリが100個を超える場合は、ページネーションの実装を検討してください
- GitHub PagesのURLは `https://kwu-cms.github.io/{リポジトリ名}` の形式を想定しています
- 言語タグは非表示になっています（管理用のため）
- PagesボタンがGitHubボタンより前に表示されます（Pagesを優先）

## ライセンス

MIT License
