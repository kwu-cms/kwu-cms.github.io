# リポジトリ管理画面（admin.html）

公開ページに出す前のリポジトリ状況を、ブラウザから確認・整理するための画面です。

## できること

- GitHub 上の最新リポジトリ一覧を取得（更新確認）
- `repositories.json`（スナップショット）との差分表示
- `custom-descriptions.json` の分類状況（授業 / Tools / 非表示 / 未分類）
- private / public の可視性確認
- 要対応項目のまとめ（未分類・Private・未収録・更新あり）

## 使い方

1. サイトのフッター「リポジトリ管理」、または `/admin.html` を開く
2. プライベートリポジトリも見る場合は PAT（`repo` スコープ）を保存する  
   - トークンはブラウザの localStorage のみ。リポジトリには保存されない
3. 「更新を確認」を押す（初回は自動実行）

## CLI での同等確認

```bash
cd scripts
export GITHUB_TOKEN=your_token_here
python fetch_repositories.py --check
```

公開用スナップショットの更新:

```bash
python fetch_repositories.py
git add repositories.json
git commit -m "Update: リポジトリ情報を更新"
```

## 運用の流れ（リポジトリ追加時）

1. GitHub にリポジトリを作成（作業中は private でも可）
2. `admin.html` または `--check` で認識されているか確認
3. 公開するタイミングで public にする
4. `custom-descriptions.json` に courses / tools を追加
5. `python scripts/fetch_repositories.py` で `repositories.json` を更新
6. 必要ならスクリーンショット生成 → コミット・プッシュ
