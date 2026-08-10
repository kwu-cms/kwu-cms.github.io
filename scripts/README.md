# スクリプト一覧

このフォルダには、プロジェクトの作業用Pythonスクリプトが含まれています。

## 📋 スクリプト一覧

### 1. `generate_screenshots.py`
GitHub Pagesの各プロジェクトページのスクリーンショットを自動生成するスクリプト

**使用方法:**
```bash
cd scripts
pip install -r requirements.txt
playwright install chromium
python generate_screenshots.py
```

**詳細:** [../docs/SCREENSHOT_SCRIPT_README.md](../docs/SCREENSHOT_SCRIPT_README.md)

### 2. `update_repo_descriptions.py`
`custom-descriptions.json`の内容を使って、GitHubの各リポジトリの説明を一括更新するスクリプト

**使用方法:**
```bash
cd scripts
pip install -r requirements.txt
export GITHUB_TOKEN=your_token_here
python update_repo_descriptions.py
```

**詳細:** [../docs/UPDATE_DESCRIPTIONS.md](../docs/UPDATE_DESCRIPTIONS.md)

### 3. `fetch_repositories.py`
GitHub APIからリポジトリ情報を取得して、JSONファイルに保存するスクリプト

**使用方法:**
```bash
cd scripts
pip install -r requirements.txt
export GITHUB_TOKEN=your_token_here  # プライベート確認・レート制限回避に推奨
python fetch_repositories.py           # repositories.json を更新（公開リポのみ）
python fetch_repositories.py --check   # 更新・分類状況の確認のみ
```

**出力:**
- `../repositories.json` - リポジトリ情報（`--check` 時は更新しない）

**補足:**
- private リポジトリは既定で JSON に含めません（公開 Pages への漏洩防止）
- ブラウザの管理画面: [`../admin.html`](../admin.html)

**メリット:**
- レート制限を回避できます
- ページの読み込みが速くなります
- GitHub APIへの依存を減らせます
- `--check` / `admin.html` で未分類・更新差分を一覧確認できます

**詳細:** [../docs/FETCH_REPOSITORIES.md](../docs/FETCH_REPOSITORIES.md)

## 🔧 セットアップ

### 必要なパッケージのインストール

```bash
cd scripts
pip install -r requirements.txt
```

### 必要なパッケージ

- `playwright>=1.40.0` - スクリーンショット生成用
- `requests>=2.31.0` - HTTPリクエスト用
- `selenium>=4.15.0` - ブラウザ自動化用（オプション）

## 📝 注意事項

- これらのスクリプトは作業用です
- GitHub APIを使用するスクリプトには、Personal Access Tokenが必要です
- トークンは機密情報です。Gitの履歴にコミットしないでください
