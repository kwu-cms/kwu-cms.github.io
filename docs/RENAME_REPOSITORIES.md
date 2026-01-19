# リポジトリ名から「2025」を削除する手順

リポジトリ名から年の表記「2025」を削除する手順です。

## 📋 変更対象

以下の3つのリポジトリ名を変更します：

- `cms-presentation-2025` → `cms-presentation`
- `digitai-fabrication-web-2025` → `digitai-fabrication-web`
- `cms-exercise-newmedia-2025` → `cms-exercise-newmedia`

## 🔧 手順

### ステップ1: GitHubでリポジトリ名を変更

各リポジトリについて、以下の手順を実行してください：

1. **リポジトリにアクセス**
   - 例: https://github.com/kwu-cms/cms-presentation-2025

2. **Settingsを開く**
   - リポジトリページの上部にある「Settings」タブをクリック

3. **リポジトリ名を変更**
   - ページの一番上にある「Repository name」セクションを探す
   - リポジトリ名を変更（例: `cms-presentation-2025` → `cms-presentation`）
   - 「Rename」ボタンをクリック

4. **確認**
   - 警告メッセージが表示されますが、「I understand, rename my repository」をクリック

5. **他のリポジトリも同様に変更**
   - `digitai-fabrication-web-2025` → `digitai-fabrication-web`
   - `cms-exercise-newmedia-2025` → `cms-exercise-newmedia`

### ステップ2: このプロジェクト内のファイルを更新

リポジトリ名を変更した後、以下のファイルを更新してください：

1. **スクリーンショット画像のファイル名を変更**
   ```bash
   cd screenshots
   mv cms-presentation-2025.png cms-presentation.png
   mv digitai-fabrication-web-2025.png digitai-fabrication-web.png
   mv cms-exercise-newmedia-2025.png cms-exercise-newmedia.png
   ```

2. **repositories.jsonを更新**
   ```bash
   cd scripts
   export GITHUB_TOKEN=your_token_here
   python fetch_repositories.py
   ```

3. **custom-descriptions.jsonを更新**
   - リポジトリ名のキーを変更

4. **script.jsのスクリーンショットマッピングを更新**
   - `initScreenshotMap()`関数内のファイル名を更新

### ステップ3: 変更をコミット・プッシュ

```bash
git add -A
git commit -m "Update: リポジトリ名から「2025」を削除"
git push origin main
```

## ⚠️ 注意事項

- **GitHub PagesのURLが変更されます**
  - 旧: `https://kwu-cms.github.io/cms-presentation-2025`
  - 新: `https://kwu-cms.github.io/cms-presentation`
  
- **既存のリンクが無効になります**
  - 他のサイトやドキュメントからリンクしている場合は、更新が必要です

- **リポジトリ名の変更は元に戻せます**
  - ただし、GitHub PagesのURLは変更されます

## 🔄 自動化スクリプト

手動で変更する代わりに、以下のスクリプトを使用することもできます：

```bash
# スクリーンショット画像のファイル名を変更
cd screenshots
mv cms-presentation-2025.png cms-presentation.png
mv digitai-fabrication-web-2025.png digitai-fabrication-web.png
mv cms-exercise-newmedia-2025.png cms-exercise-newmedia.png
cd ..

# repositories.jsonを更新
cd scripts
export GITHUB_TOKEN=your_token_here
python fetch_repositories.py
cd ..
```

その後、`custom-descriptions.json`と`script.js`を手動で更新してください。
