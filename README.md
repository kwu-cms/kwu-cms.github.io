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

### 1. リポジトリの作成

GitHubでリポジトリを作成します。推奨は `kwu-cms.github.io` です（組織名と同じ名前）。

### 2. ファイルのアップロード

このリポジトリのファイルをGitHubにプッシュします：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# リポジトリ名に応じてURLを変更してください
git remote add origin https://github.com/kwu-cms/kwu-cms.github.io.git
git push -u origin main
```

**注意:** リポジトリ名が `kwu-cms.github.io` 以外の場合は、上記のURLのリポジトリ名部分を変更してください。

### 3. GitHub Pagesの有効化

1. GitHubリポジトリの「Settings」タブに移動
2. 左サイドバーから「Pages」を選択
3. 「Source」で「Deploy from a branch」を選択
4. 「Branch」で「main」ブランチと「/ (root)」フォルダを選択
5. 「Save」をクリック

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

## 注意事項

- GitHub APIにはレート制限があります（認証なしで1時間あたり60リクエスト）
- リポジトリが100個を超える場合は、ページネーションの実装を検討してください
- GitHub PagesのURLは `https://kwu-cms.github.io/{リポジトリ名}` の形式を想定しています

## ライセンス

MIT License
