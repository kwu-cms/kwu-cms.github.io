# 組織名の確認方法

404エラーが発生している場合、組織名が間違っている可能性があります。

## 🔍 確認手順

### 1. GitHubで組織が存在するか確認

ブラウザで以下のURLにアクセスしてください：

```
https://github.com/kwu-cms
```

- **存在する場合**: 組織ページが表示されます
- **存在しない場合**: 404エラーが表示されます

### 2. 組織名が正しいか確認

組織名は以下の点に注意してください：
- 大文字小文字が正確か
- ハイフン（`-`）の位置が正しいか
- スペースが含まれていないか

### 3. 組織がパブリックか確認

組織がプライベートの場合、APIからアクセスできません。

## 🔧 組織名を変更する方法

組織名が異なる場合は、`script.js` の2行目を修正してください：

```javascript
const ORGANIZATION = '正しい組織名';
```

## 📝 よくある間違い

- `kwu-cms` → `KWU-CMS` （大文字小文字）
- `kwu-cms` → `kwu_cms` （ハイフンとアンダースコア）
- `kwu-cms` → `kwucms` （ハイフンの有無）

## 🧪 APIを直接テスト

ブラウザで以下のURLにアクセスして、APIが正常に動作するか確認：

```
https://api.github.com/orgs/kwu-cms/repos
```

- **正常な場合**: JSON形式でリポジトリ一覧が表示されます
- **404エラーの場合**: `{"message":"Not Found","documentation_url":"..."}` が表示されます

## 💡 ユーザー名を使用する場合

もし `kwu-cms` が組織ではなくユーザー名の場合、APIエンドポイントを変更する必要があります：

```javascript
// 組織の場合
const API_URL = `${GITHUB_API_BASE}/orgs/${ORGANIZATION}/repos`;

// ユーザーの場合
const API_URL = `${GITHUB_API_BASE}/users/${ORGANIZATION}/repos`;
```
