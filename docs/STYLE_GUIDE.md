# 甲南女子大学文学部メディア表現学科 ウェブページスタイルガイド

このスタイルガイドは、甲南女子大学文学部メディア表現学科の授業成果や研究情報を紹介するウェブページの統一デザインを定義します。

## カラーパレット

### プライマリカラー

学科のブランドカラーとして、マルーン（深紅）を基調とします。

```css
--primary-color: #8B2635;      /* メインマルーン */
--secondary-color: #6B1F2A;    /* 濃いマルーン（フッターなど） */
--accent-color: #A0303E;        /* アクセントマルーン */
```

**使用例：**
- ヘッダー背景
- ナビゲーション
- ボタン
- リンク
- アクティブな要素

### ニュートラルカラー

```css
--bg-color: #ffffff;            /* 背景（白） */
--card-bg: #ffffff;            /* カード背景（白） */
--text-color: #333333;         /* メインテキスト（ダークグレー） */
--text-light: #666666;         /* サブテキスト（ミディアムグレー） */
--border-color: #e0e0e0;       /* ボーダー（ライトグレー） */
```

### シャドウ

```css
--shadow: 0 2px 4px rgba(0, 0, 0, 0.08);           /* 通常のシャドウ */
--shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.12);    /* ホバー時のシャドウ */
```

## タイポグラフィ

### フォントファミリー

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
```

システムフォントを使用し、読みやすさとパフォーマンスを重視します。

### フォントサイズ

- **見出し1（h1）**: `2.5rem` (40px) - ページタイトル
- **見出し2（h2）**: `1.25rem` (20px) - セクションタイトル
- **見出し3（h3）**: `1.25rem` (20px) - カードタイトル
- **本文**: `1rem` (16px) - 標準テキスト
- **サブテキスト**: `0.95rem` (15.2px) - 説明文
- **小さなテキスト**: `0.875rem` (14px) - メタ情報

### 行間

- **本文**: `line-height: 1.6`
- **カード説明**: `line-height: 1.5`

## コンポーネント

### カード

授業成果やプロジェクトを表示するカードコンポーネントです。

```css
.repo-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    border: 1px solid #e0e0e0;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.repo-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
```

**特徴：**
- 控えめなシャドウで背景と区別
- 薄いグレーのボーダー
- ホバー時に軽く浮き上がる
- GitHub Pagesがある場合は上部にマルーンのライン（3px）

### ボタン

#### プライマリボタン

```css
.button-primary {
    background-color: #8B2635;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    transition: background-color 0.2s ease;
}

.button-primary:hover {
    background-color: #6B1F2A;
}
```

#### セカンダリボタン

```css
.button-secondary {
    background-color: #ffffff;
    color: #333333;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid #e0e0e0;
    transition: background-color 0.2s ease;
}

.button-secondary:hover {
    background-color: #f5f5f5;
}
```

### リンク

```css
a {
    color: #8B2635;
    text-decoration: none;
    transition: color 0.2s ease;
}

a:hover {
    color: #6B1F2A;
    text-decoration: underline;
}
```

### 入力フィールド

```css
input[type="text"],
input[type="search"],
textarea,
select {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background-color: #ffffff;
    color: #333333;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: #8B2635;
    box-shadow: 0 0 0 3px rgba(139, 38, 53, 0.1);
}
```

## レイアウト

### コンテナ

```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    width: 100%;
}
```

最大幅1200pxの中央配置コンテナを使用します。

### グリッドレイアウト

カードはレスポンシブグリッドで配置します。

```css
.repos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
}
```

- 最小カード幅: 300px
- カード間の余白: 2rem
- モバイルでは1列表示

### スペーシング

- **セクション間**: `3rem` (48px)
- **カード内パディング**: `1.5rem` (24px)
- **要素間の余白**: `1rem` (16px) または `0.5rem` (8px)

## ヘッダー

```css
header {
    background: #8B2635;
    color: white;
    padding: 3rem 0;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

- マルーンの背景
- 白いテキスト
- 中央揃え

## フッター

```css
footer {
    background-color: #6B1F2A;
    color: white;
    text-align: center;
    padding: 2rem 0;
    margin-top: 3rem;
}
```

- 濃いマルーンの背景
- 白いテキスト
- 中央揃え

## レスポンシブデザイン

### ブレークポイント

- **モバイル**: `max-width: 768px`
- **タブレット**: `769px - 1024px`
- **デスクトップ**: `1025px以上`

### モバイル対応

```css
@media (max-width: 768px) {
    header h1 {
        font-size: 2rem;
    }
    
    .repos-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    main {
        padding: 2rem 0;
    }
}
```

## アクセシビリティ

### コントラスト比

- テキストと背景のコントラスト比は4.5:1以上を維持
- マルーン（#8B2635）と白（#ffffff）のコントラスト比: 約7.5:1 ✅

### フォーカス表示

すべてのインタラクティブ要素に明確なフォーカス表示を設定：

```css
*:focus {
    outline: 2px solid #8B2635;
    outline-offset: 2px;
}
```

## 使用例

### HTMLテンプレート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ページタイトル - 甲南女子大学文学部メディア表現学科</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>ページタイトル</h1>
            <p class="subtitle">サブタイトル</p>
        </div>
    </header>

    <main class="container">
        <!-- コンテンツ -->
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2026 甲南女子大学文学部メディア表現学科. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
```

### CSS変数の使用

```css
/* カスタムスタイルを追加する場合 */
.my-component {
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
}

.my-button {
    background-color: var(--primary-color);
    color: white;
}

.my-button:hover {
    background-color: var(--secondary-color);
}
```

## ベストプラクティス

1. **一貫性**: このスタイルガイドに従い、統一感のあるデザインを維持する
2. **シンプルさ**: 過度な装飾を避け、コンテンツに集中する
3. **読みやすさ**: 十分なコントラストとスペーシングを確保する
4. **パフォーマンス**: システムフォントを使用し、画像は最適化する
5. **アクセシビリティ**: すべてのユーザーがアクセスできるよう配慮する

## 更新履歴

- 2026-01-21: 初版作成（マルーン基調のカラーパレット）

## 参考資料

- [甲南女子大学ウェブサイト](https://www.konan-wu.ac.jp/)
- [WCAG 2.1 アクセシビリティガイドライン](https://www.w3.org/WAI/WCAG21/quickref/)
