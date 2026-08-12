# 甲南女子大学文学部メディア表現学科 ウェブページスタイルガイド

公開一覧ページ（`index.html`）の統一デザインを定義します。

## デザイン方針

編集的ギャラリー。画像を主役に据え、深紅はアクセントに限定する。単色マルーンの帯塗りヘッダーは使わない。

## カラーパレット

```css
--ink: #1c1917;              /* 本文 */
--ink-muted: #57534e;        /* サブテキスト */
--paper: #f7f5f2;            /* ページ背景 */
--paper-deep: #efece7;       /* メディア・プレースホルダ */
--card-bg: #ffffff;          /* カード面 */
--line: rgba(28, 25, 23, 0.12);
--accent: #8B2635;           /* 深紅アクセント */
--radius: 12px;              /* カード外枠のみ */
--radius-sm: 4px;            /* タグ・ボタン */
```

互換エイリアス: `--primary-color` / `--text-color` / `--bg-color` などは admin 向けに残す。

**使用例：**
- アクセント: リンク、キッカー、セクション下線、ホバー
- 背景: 薄いウォームグレー＋微細ドット（CSS）

## タイポグラフィ

```css
--font-display: "Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif;
--font-body: "IBM Plex Sans JP", "Hiragino Sans", "Yu Gothic UI", sans-serif;
```

- 見出し（学科名、セクション、カードタイトル）: Shippori Mincho
- 本文・UI: IBM Plex Sans JP

## カード

```html
<article class="repo-card is-clickable has-pages">
  <div class="repo-media has-image">
    <div class="repo-media-image"></div>
  </div>
  <div class="repo-body">
    <div class="repo-tags">...</div>
    <h3 class="repo-title">...</h3>
    <p class="repo-summary">...</p>
    <p class="repo-description">...</p>
    <div class="repo-meta">...</div>
  </div>
</article>
```

**ルール：**
- 角丸はカード外側のみ（`--radius: 12px`）
- 画像は上端フルブリード（パディング内に inset しない）
- `aspect-ratio: 16 / 9`、ホバーで画像のみわずかにスケール
- タグは `tags` 配列の自由記述文字列を矩形チップで表示（`--radius-sm`）
- 授業は `courses`、特設サイトは `events`、ツールは `tools`
- 旧 `year` / `type` はパーサが互換変換する（`"none"` は無視）
- ボーダーは1本（`--line`）。上部のアクセントバーは使わない

## ヘッダー / フッター

- ヘッダー: 透明／紙面同系。ブランド名を明朝で大きく、下に短いアクセントライン
- フッター: ベタ塗りなし。上ボーダー＋ミュートテキスト

## モーション

1. ヘッダー下線の入場
2. セクション見出し下線の scaleX
3. カードの fade-up（`.reveal.is-visible`）＋ホバー時の画像スケール

`prefers-reduced-motion: reduce` で無効化。

## レイアウト

```css
.container { max-width: 1120px; }
.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.75rem;
}
```

## 避けること

- 紫グラデーション、クリーム＋テラコッタ定番、ダークモード基調
- 画像上のタイトルオーバーレイ
- 角丸の混在（8 / 12 / 6px など）
- 丸ピル型タグ、多重シャドウ

## 更新履歴

- 2026-08-12: 編集的ギャラリーへ改修（フルブリード画像・明朝＋サンセリフ・紙面トーン）
- 2026-01-21: 初版作成（マルーン基調）
