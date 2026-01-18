# 認証エラーの解決方法

`Permission denied` エラーが発生した場合の対処法です。

## 🔐 解決方法1: SSH認証を使用（推奨）

### SSHキーが設定されている場合

リモートURLをSSHに変更：

```bash
git remote set-url origin git@github.com:kwu-cms/kwu-cms.github.io.git
git push -u origin main
```

### SSHキーが設定されていない場合

1. **SSHキーを生成**（まだ持っていない場合）：
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. **SSHキーをGitHubに追加**：
```bash
# 公開鍵をクリップボードにコピー
pbcopy < ~/.ssh/id_ed25519.pub
```

その後、GitHubにログインして：
- Settings → SSH and GPG keys → New SSH key
- コピーしたキーを貼り付けて保存

3. **リモートURLをSSHに変更**：
```bash
git remote set-url origin git@github.com:kwu-cms/kwu-cms.github.io.git
git push -u origin main
```

## 🔑 解決方法2: Personal Access Token (PAT) を使用

### PATの作成

1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. 以下のスコープを選択：
   - `repo` (すべてのリポジトリへのアクセス)
   - `write:org` (組織への書き込み権限、組織リポジトリの場合)
5. Generate token をクリック
6. **トークンをコピー**（後で表示されません）

### PATを使用してプッシュ

```bash
# リモートURLにユーザー名を含める
git remote set-url origin https://takawo@github.com/kwu-cms/kwu-cms.github.io.git

# プッシュ時にパスワードの代わりにPATを入力
git push -u origin main
# Username: takawo
# Password: <ここにPATを貼り付け>
```

または、URLに直接含める（セキュリティ上推奨されません）：

```bash
git remote set-url origin https://takawo:YOUR_TOKEN@github.com/kwu-cms/kwu-cms.github.io.git
git push -u origin main
```

## 👥 解決方法3: 組織の権限を確認

`kwu-cms` 組織のリポジトリにプッシュするには、以下のいずれかが必要です：

1. **組織のメンバー**であること
2. **リポジトリへの書き込み権限**があること

確認方法：
- GitHubで `kwu-cms` 組織のページにアクセス
- メンバーリストを確認
- リポジトリの Settings → Collaborators で権限を確認

## 🔍 現在の設定を確認

```bash
# リモートURLを確認
git remote -v

# Git設定を確認
git config --list | grep user
```

## 📝 推奨される手順

1. **まずSSHを試す**（最も安全で便利）
2. SSHが使えない場合は**PATを使用**
3. それでもエラーが出る場合は**組織の権限を確認**

## ⚠️ 注意事項

- PATは機密情報です。他人と共有しないでください
- PATをGitの設定に保存する場合は、credential helperを使用：
```bash
git config --global credential.helper osxkeychain  # macOSの場合
```
