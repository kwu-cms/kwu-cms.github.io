# GitHubリポジトリの説明を編集する方法

## 📝 方法1: GitHubのWebインターフェースで編集（推奨）

### 手順

1. **GitHubにログイン**
   - https://github.com/kwu-cms にアクセス

2. **リポジトリを選択**
   - 説明を編集したいリポジトリをクリック

3. **設定を開く**
   - リポジトリページの上部にある「Settings」タブをクリック

4. **説明を編集**
   - ページの一番上にある「Repository name」の下に「Description」フィールドがあります
   - ここに説明を入力または編集
   - 「Save changes」ボタンをクリック

### メリット
- ✅ 最も簡単で確実な方法
- ✅ 変更がすぐに反映される
- ✅ 認証やトークンが不要

## 🔧 方法2: GitHub APIを使用（プログラムから）

### 必要なもの
- GitHub Personal Access Token (PAT)
  - スコープ: `repo`（リポジトリへの書き込み権限）

### PATの作成方法

1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. 「Generate new token (classic)」をクリック
4. 以下のスコープを選択：
   - `repo` (すべてのリポジトリへのアクセス)
5. 「Generate token」をクリック
6. **トークンをコピー**（後で表示されません）

### APIを使用して更新

```bash
curl -X PATCH \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/kwu-cms/リポジトリ名 \
  -d '{"description":"新しい説明"}'
```

### このWebアプリから更新する場合

1. リポジトリカードの説明の横にある編集ボタン（✏️）をクリック
2. 説明を編集して「保存」をクリック
3. 「GitHub APIを使ってリポジトリの説明を直接更新しますか？」というダイアログが表示されます
4. 「OK」を選択して、Personal Access Tokenを入力
5. 説明がGitHubリポジトリに直接反映されます

## 📄 方法3: JSONファイルを使用（このリポジトリ内）

### 手順

1. **説明を編集**
   - このWebアプリで説明を編集して「保存」をクリック
   - JSONファイルが自動的にダウンロードされます

2. **ファイルをコミット**
   ```bash
   git add custom-descriptions.json
   git commit -m "Update: リポジトリの説明を更新"
   git push origin main
   ```

3. **反映確認**
   - ページをリロードすると、更新された説明が表示されます

### メリット
- ✅ 変更履歴がGitで管理される
- ✅ チームで共有できる
- ✅ GitHub APIの認証が不要

## 🎯 推奨される方法

### 個別のリポジトリの説明を編集する場合
→ **方法1: GitHubのWebインターフェース**（最も簡単）

### 複数のリポジトリの説明を一括で編集する場合
→ **方法2: GitHub API**（プログラムから）

### このWebアプリの表示用にカスタム説明を追加する場合
→ **方法3: JSONファイル**（このリポジトリ内に保存）

## ⚠️ 注意事項

- GitHub APIを使用する場合、Personal Access Tokenは機密情報です
- トークンを他人と共有しないでください
- トークンをGitの履歴にコミットしないでください
- 不要になったトークンは削除してください

## 📚 関連ドキュメント

- [GitHub API ドキュメント](https://docs.github.com/en/rest/repos/repos#update-a-repository)
- [Personal Access Token の作成方法](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
