# GitHubリポジトリの説明を更新する方法

`custom-descriptions.json`の内容を使って、GitHubの各リポジトリの説明を一括更新する方法です。

## 🚀 実行方法

### 方法1: 環境変数でトークンを設定

```bash
cd scripts
export GITHUB_TOKEN=your_github_token_here
python update_repo_descriptions.py
```

### 方法2: 実行時にトークンを入力

```bash
cd scripts
python update_repo_descriptions.py
```

実行時にトークンの入力を求められます。

## 🔐 GitHub Personal Access Tokenの作成方法

1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. 「Generate new token (classic)」をクリック
4. 以下のスコープを選択：
   - `repo` (すべてのリポジトリへのアクセス)
5. 「Generate token」をクリック
6. **トークンをコピー**（後で表示されません）

## 📋 実行例

```bash
$ cd scripts
$ python update_repo_descriptions.py
============================================================
GitHubリポジトリの説明を更新します
============================================================

更新対象: 4個のリポジトリ

  - kwu-cms.github.io
  - cms-exercise-newmedia-2025
  - digitai-fabrication-web-2025
  - cms-presentation-2025

続行しますか？ (y/N): y
GitHub Personal Access Tokenが必要です。
環境変数 GITHUB_TOKEN を設定するか、以下に入力してください。
GitHub Token: ghp_xxxxxxxxxxxxx

✅ [kwu-cms.github.io] 説明を更新しました
✅ [cms-exercise-newmedia-2025] 説明を更新しました
✅ [digitai-fabrication-web-2025] 説明を更新しました
✅ [cms-presentation-2025] 説明を更新しました

============================================================
完了: 4個成功, 0個失敗
============================================================
```

## ⚠️ 注意事項

- トークンは機密情報です。他人と共有しないでください
- トークンをGitの履歴にコミットしないでください
- 環境変数を使用する場合は、`.bashrc`や`.zshrc`に設定するか、実行時にのみ設定してください

## 🐛 トラブルシューティング

### エラー: "Bad credentials"
- トークンが正しく入力されているか確認
- トークンに`repo`スコープが含まれているか確認

### エラー: "Not Found"
- リポジトリ名が正しいか確認
- リポジトリへのアクセス権限があるか確認

### エラー: "Resource not accessible by integration"
- 組織のリポジトリの場合、組織の設定で「Third-party access」を許可する必要がある場合があります
