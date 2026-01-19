# リポジトリ情報の事前取得方法

GitHub APIのレート制限を回避するため、リポジトリ情報を事前に取得してJSONファイルに保存する方法です。

## 🎯 目的

- **レート制限の回避**: GitHub APIのレート制限に達することを防ぎます
- **高速な読み込み**: JSONファイルから読み込むため、ページの読み込みが速くなります
- **オフライン対応**: JSONファイルがあれば、GitHub APIにアクセスできなくても動作します

## 🚀 使用方法

### 1. スクリプトを実行

```bash
cd scripts
export GITHUB_TOKEN=your_token_here  # オプション（推奨）
python fetch_repositories.py
```

### 2. 出力ファイルを確認

`repositories.json`ファイルがプロジェクトのルートディレクトリに作成されます。

### 3. Gitにコミット

```bash
git add repositories.json
git commit -m "Update: リポジトリ情報を更新"
git push origin main
```

## 📋 出力ファイルの形式

`repositories.json`の形式：

```json
{
  "account_name": "kwu-cms",
  "fetched_at": "2026-01-19T10:00:00",
  "count": 4,
  "repositories": [
    {
      "id": 123456789,
      "name": "kwu-cms.github.io",
      "full_name": "kwu-cms/kwu-cms.github.io",
      "description": "説明",
      "updated_at": "2026-01-19T09:00:00Z",
      "language": "HTML",
      "stargazers_count": 0,
      ...
    },
    ...
  ]
}
```

## 🔄 更新頻度

リポジトリ情報は定期的に更新することを推奨します：

- **推奨**: 1日1回
- **最低**: 1週間1回

更新する場合は、再度スクリプトを実行してください。

## 🤖 GitHub Actionsで自動化（オプション）

GitHub Actionsを使用して、定期的にリポジトリ情報を自動更新できます。

`.github/workflows/update-repositories.yml`を作成：

```yaml
name: Update Repositories

on:
  schedule:
    - cron: '0 0 * * *'  # 毎日0時（UTC）
  workflow_dispatch:  # 手動実行も可能

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd scripts
          pip install -r requirements.txt
      - name: Fetch repositories
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          cd scripts
          python fetch_repositories.py
      - name: Commit and push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add repositories.json
          git diff --staged --quiet || git commit -m "Update: リポジトリ情報を自動更新"
          git push
```

## 📝 動作の仕組み

1. **スクリプト実行時**: GitHub APIからリポジトリ情報を取得して`repositories.json`に保存
2. **ページ読み込み時**: `script.js`がまず`repositories.json`から読み込みを試みる
3. **フォールバック**: JSONファイルがない場合のみ、GitHub APIから取得

## ⚠️ 注意事項

- `repositories.json`はGitにコミットしてください
- 定期的に更新することを推奨します
- GitHub APIのレート制限を回避するため、Personal Access Tokenの使用を推奨します

## 🔍 トラブルシューティング

### JSONファイルが読み込まれない場合

1. `repositories.json`がプロジェクトのルートディレクトリにあるか確認
2. ファイルの形式が正しいか確認（JSON形式）
3. ブラウザのコンソールでエラーメッセージを確認

### GitHub APIから取得する場合

JSONファイルがない場合、自動的にGitHub APIから取得します。この場合、レート制限に達する可能性があります。
