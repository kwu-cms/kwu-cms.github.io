# デプロイ手順

このファイルは、作成したファイルをGitHubリポジトリ `kwu-cms.github.io` にプッシュする手順です。

## 📋 前提条件

- Gitがインストールされていること
- GitHubアカウントにkwu-cms組織へのアクセス権限があること
- リポジトリ `https://github.com/kwu-cms/kwu-cms.github.io` が既に作成されていること

## 🚀 デプロイ手順

### 1. ターミナルでプロジェクトディレクトリに移動

```bash
cd /Users/takawo/Library/CloudStorage/Dropbox/kwu-cms-web
```

### 2. Gitリポジトリを初期化

```bash
git init
```

### 3. すべてのファイルをステージング

```bash
git add .
```

### 4. 初回コミットを作成

```bash
git commit -m "Initial commit: Add GitHub Pages project listing site"
```

### 5. メインブランチに設定

```bash
git branch -M main
```

### 6. リモートリポジトリを追加

```bash
git remote add origin https://github.com/kwu-cms/kwu-cms.github.io.git
```

**注意:** 既にリモートが設定されている場合は、以下のコマンドで更新してください：
```bash
git remote set-url origin https://github.com/kwu-cms/kwu-cms.github.io.git
```

### 7. GitHubにプッシュ

```bash
git push -u origin main
```

認証が求められた場合は、GitHubの認証情報を入力してください。

## ⚙️ GitHub Pagesの有効化

ファイルをプッシュした後、GitHub Pagesを有効化します：

1. GitHubリポジトリ `https://github.com/kwu-cms/kwu-cms.github.io` にアクセス
2. 「Settings」タブをクリック
3. 左サイドバーから「Pages」を選択
4. 「Source」セクションで以下を設定：
   - 「Deploy from a branch」を選択
   - 「Branch」で「main」を選択
   - 「Folder」で「/ (root)」を選択
5. 「Save」ボタンをクリック

数分後（通常1-2分）、以下のURLでサイトにアクセスできるようになります：
- **URL**: `https://kwu-cms.github.io`

## 🔄 今後の更新手順

ファイルを変更した場合は、以下のコマンドで更新をプッシュできます：

```bash
git add .
git commit -m "Update: 変更内容の説明"
git push origin main
```

GitHub Pagesは自動的に再デプロイされます（数分かかる場合があります）。

## 🐛 トラブルシューティング

### 認証エラーが発生する場合

GitHubの認証方法を確認してください：
- Personal Access Token (PAT) を使用する場合
- SSHキーを使用する場合（推奨）

SSHを使用する場合は、リモートURLを変更：
```bash
git remote set-url origin git@github.com:kwu-cms/kwu-cms.github.io.git
```

### プッシュが拒否される場合

リモートリポジトリに既にファイルがある場合は、先にプルしてください：
```bash
git pull origin main --allow-unrelated-histories
```

その後、再度プッシュを試してください。

### GitHub Pagesが表示されない場合

1. Settings > Pages で設定を確認
2. Actionsタブでデプロイのログを確認
3. 数分待ってから再度アクセスを試す

## 📝 含まれるファイル

以下のファイルがリポジトリに含まれます：

- `index.html` - メインページ
- `styles.css` - スタイルシート
- `script.js` - JavaScript（GitHub API連携）
- `README.md` - プロジェクトの説明
- `REPOSITORY_NAMES.md` - リポジトリ名の候補リスト
- `DEPLOY.md` - このファイル
- `.gitignore` - Git除外設定
