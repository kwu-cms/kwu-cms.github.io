# GitHubへのプッシュ手順（PAT使用）

Personal Access Tokenを使用してGitHubにプッシュする手順です。

## 🚀 実行するコマンド

ターミナルで以下のコマンドを順番に実行してください：

### 1. リモートURLを更新（ユーザー名を含める）

```bash
git remote set-url origin https://takawo@github.com/kwu-cms/kwu-cms.github.io.git
```

### 2. プッシュを実行

```bash
git push -u origin main
```

### 3. 認証情報の入力

プロンプトが表示されたら：

- **Username**: `takawo` （またはGitHubのユーザー名）
- **Password**: `<ここにPATを貼り付け>` （Personal Access Tokenを入力）

## 🔐 より安全な方法（推奨）

PATを毎回入力する代わりに、credential helperを使用：

```bash
# credential helperを設定（macOSの場合）
git config credential.helper osxkeychain

# プッシュ（初回のみPATを入力、次回からは自動）
git push -u origin main
```

これで、次回からは自動的に認証情報が使用されます。

## ⚠️ 注意事項

- PATは機密情報です。他人と共有しないでください
- PATをGitの履歴にコミットしないでください
- 必要に応じて、PATのスコープを最小限に設定してください

## ✅ 成功した場合

以下のようなメッセージが表示されます：

```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/kwu-cms/kwu-cms.github.io.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## 🐛 エラーが発生した場合

### "Permission denied" エラー

- PATが正しくコピーされているか確認
- PATに `repo` スコープが含まれているか確認
- 組織のリポジトリへの書き込み権限があるか確認

### "remote: Invalid username or password" エラー

- PATが有効期限内か確認
- PATが正しく入力されているか確認（スペースや改行が含まれていないか）
