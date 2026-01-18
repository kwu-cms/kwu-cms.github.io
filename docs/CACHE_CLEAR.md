# キャッシュクリア方法

GitHub Pagesで古いコードが表示される場合の対処法です。

## 🔄 ブラウザのキャッシュをクリア

### 方法1: 強制リロード（推奨）

- **Windows/Linux**: `Ctrl + Shift + R` または `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 方法2: 開発者ツールからクリア

1. 開発者ツール（F12）を開く
2. Networkタブを選択
3. 「Disable cache」にチェックを入れる
4. ページをリロード（F5）

### 方法3: シークレットモードで確認

- **Windows/Linux**: `Ctrl + Shift + N`
- **Mac**: `Cmd + Shift + N`

シークレットモードで `https://kwu-cms.github.io` にアクセスして、最新のコードが表示されるか確認してください。

## ⏱️ GitHub Pagesのデプロイ待機

GitHub Pagesのデプロイには数分かかる場合があります：

1. GitHubリポジトリの「Actions」タブを確認
2. 最新のデプロイが完了しているか確認
3. デプロイが完了するまで数分待つ

## 🔍 最新コードの確認

GitHubリポジトリで `script.js` の内容を確認：

```
https://github.com/kwu-cms/kwu-cms.github.io/blob/main/script.js
```

以下のコードが含まれているか確認：

```javascript
const ACCOUNT_NAME = 'kwu-cms';
const ACCOUNT_TYPE = 'auto';
```

エラーメッセージが「アカウント」となっているか確認してください。
