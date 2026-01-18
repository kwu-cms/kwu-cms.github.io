# スクリーンショット自動生成スクリプト

Pythonスクリプトを使用して、GitHub Pagesの各プロジェクトページのスクリーンショットを自動生成します。

## 📋 必要なもの

- Python 3.8以上
- Playwright または Selenium（ブラウザ自動化ツール）

## 🚀 セットアップ

### 1. 必要なパッケージをインストール

```zsh
pip install -r requirements.txt
```

### 2. Playwrightのブラウザをインストール（推奨）

```zsh
playwright install chromium
```

### 3. Personal Access Tokenを設定（オプション、推奨）

レート制限を1時間あたり5000リクエストに増やすために、GitHub Personal Access Tokenを設定できます：

**方法1: 環境変数として設定（推奨）**

```zsh
export GITHUB_TOKEN='your_personal_access_token_here'
python generate_screenshots.py
```

**方法2: スクリプト内で設定**

`generate_screenshots.py` の `GITHUB_TOKEN` 変数を編集：

```python
GITHUB_TOKEN = 'your_personal_access_token_here'
```

**PATの作成方法:**

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. `repo` スコープを選択
4. トークンをコピー

**PATH警告が出る場合:**

Playwrightのインストール時にPATH警告が出る場合、以下のいずれかの方法で対処できます：

**方法1: PATHに追加（推奨）**

```zsh
# zshの場合（macOSのデフォルト）
echo 'export PATH="/Library/Frameworks/Python.framework/Versions/3.11/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# bashの場合（Linuxなど）
echo 'export PATH="/Library/Frameworks/Python.framework/Versions/3.11/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

**方法2: 警告を無視**

警告は表示されますが、スクリプトの実行には影響しません。`python generate_screenshots.py` は正常に動作します。

**方法3: フルパスで実行**

```bash
/Library/Frameworks/Python.framework/Versions/3.11/bin/playwright install chromium
```

または、Seleniumを使用する場合：

```bash
# ChromeDriverが必要です
# macOS: brew install chromedriver
# または、Selenium Managerが自動的にダウンロードします
```

## 📝 使用方法

### 基本的な使い方

```bash
python generate_screenshots.py
```

### 設定の変更

`generate_screenshots.py` の以下の変数を変更できます：

```python
ACCOUNT_NAME = 'kwu-cms'  # GitHubアカウント名
OUTPUT_DIR = 'screenshots'  # 出力ディレクトリ
SCREENSHOT_WIDTH = 1200  # スクリーンショットの幅
SCREENSHOT_HEIGHT = 630  # スクリーンショットの高さ
WAIT_TIME = 3  # ページ読み込み待機時間（秒）
```

## 🎯 動作の流れ

1. GitHub APIからリポジトリ一覧を取得
2. 各リポジトリのGitHub Pages URLを生成
3. 各ページにアクセスしてスクリーンショットを撮影
4. `screenshots/` ディレクトリに保存（ファイル名: `リポジトリ名.png`）

## 📁 出力ファイル

スクリーンショットは `screenshots/` ディレクトリに保存されます：

```
screenshots/
├── cms-exercise-newmedia-2025.png
├── cms-presentation-2025.png
├── digitai-fabrication-web-2025.png
└── kwu-cms.github.io.png
```

## 🔄 各プロジェクトに画像を配置する方法

### 方法1: 手動で配置

1. 生成されたスクリーンショットを各プロジェクトのリポジトリにコピー
2. ファイル名を `screenshot.png` または `og-image.png` にリネーム
3. リポジトリのルートまたは `images/` フォルダに配置
4. コミット・プッシュ

### 方法2: 自動で配置するスクリプトを作成

各リポジトリに自動的に画像を配置するスクリプトも作成できます（GitHub APIの認証が必要）。

## ⚙️ トラブルシューティング

### Playwrightがインストールされない場合

```bash
pip install playwright
playwright install chromium
```

### SeleniumでChromeDriverが見つからない場合

```bash
# macOS
brew install chromedriver

# または、Selenium 4.6以降では自動的にダウンロードされます
```

### ページが読み込まれない場合

`WAIT_TIME` を増やしてください：

```python
WAIT_TIME = 5  # 5秒に変更
```

### タイムアウトエラーが発生する場合

スクリプト内の `timeout=30000` を増やしてください。

## 📊 実行例

```bash
$ python generate_screenshots.py
============================================================
GitHub Pages スクリーンショット生成ツール
============================================================
リポジトリ一覧を取得中: kwu-cms...
取得したリポジトリ数: 4個

使用する方法: Playwright
出力ディレクトリ: /path/to/kwu-cms-web/screenshots
スクリーンショットサイズ: 1200x630px

[cms-exercise-newmedia-2025]
  アクセス中: https://kwu-cms.github.io/cms-exercise-newmedia-2025
  ✓ 保存完了: screenshots/cms-exercise-newmedia-2025.png

[cms-presentation-2025]
  アクセス中: https://kwu-cms.github.io/cms-presentation-2025
  ✓ 保存完了: screenshots/cms-presentation-2025.png

============================================================
完了!
成功: 4個
スキップ: 0個
エラー: 0個
出力ディレクトリ: /path/to/kwu-cms-web/screenshots
============================================================
```

## 🔐 GitHub APIのレート制限

GitHub APIにはレート制限があります（認証なしで1時間あたり60リクエスト）。
多くのリポジトリがある場合は、Personal Access Tokenを使用することを推奨します：

```python
headers = {'Authorization': f'token YOUR_TOKEN'}
response = requests.get(endpoint, headers=headers)
```

## 💡 ヒント

- スクリーンショットは一度生成すれば、各プロジェクトのリポジトリに配置するまで再利用できます
- 既にスクリーンショットが存在する場合はスキップされます
- GitHub Pagesが存在しないリポジトリは自動的にスキップされます
