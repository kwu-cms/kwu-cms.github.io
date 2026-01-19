# GitHubリポジトリの説明を編集する方法

GitHubのWebインターフェースを使って、リポジトリの説明を編集する手順です。

## 📝 基本的な編集手順

### ステップ1: リポジトリにアクセス

1. **GitHubにログイン**
   - https://github.com/kwu-cms にアクセス
   - ログインしていない場合は、GitHubアカウントでログイン

2. **編集したいリポジトリを選択**
   - 組織ページから、説明を編集したいリポジトリをクリック
   - 例: `kwu-cms.github.io`、`cms-exercise-newmedia-2025` など

### ステップ2: 設定ページを開く

1. **リポジトリページの上部にあるタブから「Settings」をクリック**
   - リポジトリ名の下に、`Code`、`Issues`、`Pull requests`、`Actions`、`Settings` などのタブが表示されています
   - 右端の「**Settings**」タブをクリック

### ステップ3: 説明を編集

1. **設定ページの一番上に「Repository name」セクションがあります**
   - このセクションの下に「**Description**」というフィールドがあります

2. **説明フィールドを編集**
   - 「Description」フィールドに説明を入力または編集
   - 例: 「甲南女子大学メディア表現学科での授業成果や研究情報の一覧とURLを公開するウェブページ」

3. **変更を保存**
   - ページの下部または上部にある「**Save changes**」ボタンをクリック
   - 変更が保存されます

### ステップ4: 確認

1. **リポジトリのトップページに戻る**
   - 「Code」タブをクリックしてリポジトリのトップページに戻る
   - リポジトリ名の下に、編集した説明が表示されていることを確認

2. **このWebアプリで確認**
   - https://kwu-cms.github.io にアクセス
   - ページをリロード（Ctrl+R / Cmd+R）
   - 更新された説明が表示されることを確認

## 🎯 具体的な例

### 例: `kwu-cms.github.io` の説明を編集する場合

1. https://github.com/kwu-cms/kwu-cms.github.io にアクセス
2. 「Settings」タブをクリック
3. 「Description」フィールドに以下を入力:
   ```
   甲南女子大学メディア表現学科での授業成果や研究情報の一覧とURLを公開するウェブページ
   ```
4. 「Save changes」をクリック
5. 完了！

## ⚠️ 注意事項

### 権限について

- **リポジトリへの書き込み権限が必要です**
- 組織のリポジトリの場合、組織のメンバーである必要があります
- 権限がない場合は、組織のオーナーまたは管理者に依頼してください

### 説明の長さ

- GitHubの説明フィールドは**最大160文字**まで入力できます
- それ以上長い説明を入力したい場合は、READMEファイルに詳細を記載することをお勧めします

### 変更の反映

- 説明を変更すると、**すぐにGitHubに反映**されます
- このWebアプリ（https://kwu-cms.github.io）では、ページをリロードすると新しい説明が表示されます
- GitHub APIのキャッシュの関係で、反映まで数秒かかる場合があります

## 🔄 複数のリポジトリの説明を一括で編集する場合

複数のリポジトリの説明を一度に編集したい場合は、以下の方法を使用できます：

### 方法1: Pythonスクリプトを使用（推奨）

`custom-descriptions.json`ファイルに説明を記載し、`update_repo_descriptions.py`スクリプトを実行します。

詳細は [UPDATE_DESCRIPTIONS.md](./UPDATE_DESCRIPTIONS.md) を参照してください。

### 方法2: GitHub APIを直接使用

```bash
curl -X PATCH \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/kwu-cms/リポジトリ名 \
  -d '{"description":"新しい説明"}'
```

## 📚 関連ドキュメント

- [UPDATE_DESCRIPTIONS.md](./UPDATE_DESCRIPTIONS.md) - 一括更新スクリプトの使用方法
- [GITHUB_REPO_DESCRIPTION.md](./GITHUB_REPO_DESCRIPTION.md) - その他の編集方法
- [DESCRIPTION_EDIT_GUIDE.md](./DESCRIPTION_EDIT_GUIDE.md) - このWebアプリでの編集方法

## 💡 よくある質問

### Q: 説明を削除したい場合は？

A: 「Description」フィールドを空にして「Save changes」をクリックしてください。

### Q: 説明が反映されない場合は？

A: 以下の点を確認してください：
1. 「Save changes」ボタンをクリックしたか
2. ページをリロードしたか
3. リポジトリへの書き込み権限があるか

### Q: 説明に改行を入れたい場合は？

A: GitHubの説明フィールドでは改行は表示されません。改行を含む詳細な説明が必要な場合は、READMEファイルに記載してください。
