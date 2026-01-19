# GitHub APIレート制限の回避方法

GitHub APIにはレート制限があり、一定時間で「アカウントが見つかりません」というエラーが表示されることがあります。このガイドでは、レート制限を回避する方法を説明します。

## 🔴 レート制限とは

GitHub APIには以下のレート制限があります：

- **認証なし**: 1時間あたり60リクエスト
- **認証あり（Personal Access Token）**: 1時間あたり5,000リクエスト

レート制限に達すると、403エラーが返され、場合によっては「アカウントが見つかりません」という誤ったエラーメッセージが表示されることがあります。

## ✅ 解決方法

### 方法1: Personal Access Tokenを使用（推奨）

最も効果的な方法は、GitHub Personal Access Tokenを使用することです。

#### 1. Personal Access Tokenを作成

1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. 「Generate new token (classic)」をクリック
4. 以下のスコープを選択：
   - `public_repo` (公開リポジトリへの読み取りアクセス)
   - または `repo` (すべてのリポジトリへのアクセス)
5. 「Generate token」をクリック
6. **トークンをコピー**（後で表示されません）

#### 2. ブラウザの開発者ツールでトークンを設定

1. ページを開く（https://kwu-cms.github.io）
2. 開発者ツールを開く（F12）
3. Consoleタブを選択
4. 以下のコードを実行：

```javascript
localStorage.setItem('github_token', 'your_token_here');
location.reload();
```

**注意**: この方法は、ブラウザのlocalStorageにトークンを保存します。セキュリティ上の理由から、本番環境では推奨されません。

### 方法2: レート制限がリセットされるまで待つ

レート制限は1時間ごとにリセットされます。エラーメッセージに表示されている「リセット時刻」まで待ってから、「再試行」ボタンをクリックしてください。

### 方法3: レート制限情報をクリアする

ページをリロードしてもレート制限情報が残っている場合は、以下のコードを開発者ツールのConsoleで実行してください：

```javascript
localStorage.removeItem('github_rate_limit');
location.reload();
```

## 🔍 レート制限の確認方法

### ブラウザの開発者ツールで確認

1. 開発者ツールを開く（F12）
2. Networkタブを選択
3. ページをリロード
4. `api.github.com` へのリクエストを確認
5. Response Headersに以下が含まれています：
   - `X-RateLimit-Remaining`: 残りリクエスト数
   - `X-RateLimit-Reset`: リセット時刻（Unixタイムスタンプ）

### APIを直接確認

ブラウザで以下のURLにアクセス：

```
https://api.github.com/rate_limit
```

レスポンス例：

```json
{
  "resources": {
    "core": {
      "limit": 60,
      "remaining": 0,
      "reset": 1234567890
    }
  }
}
```

## 💡 自動的なレート制限回避機能

このWebアプリには、以下の機能が実装されています：

1. **レート制限の自動検出**: レート制限に達した場合、適切なエラーメッセージを表示します
2. **レート制限情報の保存**: localStorageにレート制限情報を保存し、リセット時刻まで再試行を抑制します
3. **リセット時刻の表示**: エラーメッセージにリセット時刻を表示します

## ⚠️ 注意事項

- Personal Access Tokenは機密情報です。他人と共有しないでください
- トークンをGitの履歴にコミットしないでください
- 不要になったトークンは削除してください
- ブラウザのlocalStorageにトークンを保存する方法は、セキュリティ上のリスクがあります

## 📚 関連ドキュメント

- [GitHub API レート制限のドキュメント](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Personal Access Token の作成方法](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
