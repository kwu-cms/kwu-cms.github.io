# インストール時のトラブルシューティング

## PlaywrightのPATH警告

### 警告メッセージ

```
[playwright]  WARNING: The script playwright is installed in '/Library/Frameworks/Python.framework/Versions/3.11/bin' which is not on PATH.
Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
```

### 解決方法

この警告は、PlaywrightのスクリプトがPATHに含まれていないことを示しています。以下のいずれかの方法で対処できます。

#### 方法1: PATHに追加（推奨）

**macOS (zsh) の場合（推奨）:**

```zsh
# PATHを追加
echo 'export PATH="/Library/Frameworks/Python.framework/Versions/3.11/bin:$PATH"' >> ~/.zshrc

# 設定を反映
source ~/.zshrc

# 確認
which playwright
```

**macOS (bash) の場合:**

```bash
# PATHを追加
echo 'export PATH="/Library/Frameworks/Python.framework/Versions/3.11/bin:$PATH"' >> ~/.bash_profile

# 設定を反映
source ~/.bash_profile

# 確認
which playwright
```

**Linux (bash) の場合:**

```bash
# PATHを追加
echo 'export PATH="/Library/Frameworks/Python.framework/Versions/3.11/bin:$PATH"' >> ~/.bashrc

# 設定を反映
source ~/.bashrc
```

#### 方法2: 警告を無視

警告は表示されますが、スクリプトの実行には影響しません。`python generate_screenshots.py` は正常に動作します。

#### 方法3: フルパスで実行

```bash
/Library/Frameworks/Python.framework/Versions/3.11/bin/playwright install chromium
```

#### 方法4: Pythonモジュールとして実行

```bash
python -m playwright install chromium
```

### 確認方法

PATHが正しく設定されているか確認：

```zsh
# playwrightコマンドの場所を確認
which playwright

# PATHにPythonのbinディレクトリが含まれているか確認
echo $PATH | grep Python
```

**確認結果の例:**

```
/Library/Frameworks/Python.framework/Versions/3.11/bin/playwright
/Library/Frameworks/Python.framework/Versions/3.11/bin:/Users/takawo/.nvm/versions/node/v23.0.0/bin:...
```

上記のように `which playwright` でパスが表示され、`echo $PATH` に `/Library/Frameworks/Python.framework/Versions/3.11/bin` が含まれていれば、PATHは正しく設定されています。警告は無視して問題ありません。

## その他のよくある問題

### Pythonのバージョンが異なる場合

警告メッセージのパスが異なる場合（例: `3.12` や `3.10`）、そのバージョンのパスを使用してください：

```zsh
# 例: Python 3.12の場合
echo 'export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 仮想環境を使用している場合

仮想環境を使用している場合、PATH警告は通常発生しません。仮想環境内でインストールしてください：

```zsh
# 仮想環境を作成
python -m venv venv

# 仮想環境を有効化（zshの場合）
source venv/bin/activate

# パッケージをインストール
pip install -r requirements.txt
playwright install chromium
```

### 権限エラーが発生する場合

```zsh
# sudoを使用（推奨されません）
sudo pip install playwright
sudo playwright install chromium

# または、ユーザーインストールを使用（推奨）
pip install --user playwright
~/.local/bin/playwright install chromium
```

## 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/python/docs/intro)
- [Python PATH設定ガイド](https://docs.python.org/3/using/windows.html#configuring-python)
