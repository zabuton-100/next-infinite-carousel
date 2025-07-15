# プロジェクト構造の理解

### 📁 基本的なディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   ├── demo/carousel/     # デモページ
│   └── page.tsx          # メインページ
├── components/            # 再利用可能なコンポーネント
│   ├── InfiniteCarousel.tsx
│   ├── CarouselServer.tsx
│   └── useResponsiveCarouselCount.ts
└── lib/                   # ユーティリティ関数
```

### 📁 ディレクトリの役割

- **`app/`**: Next.js 13+のApp Router。ページとレイアウトを管理
- **`components/`**: 再利用可能なUIコンポーネント
- **`lib/`**: 共通のユーティリティ関数やヘルパー

### 🎯 App Routerの詳細解説

#### App Routerとは？

App Routerは、Next.js 13以降で導入された新しいルーティングシステムです。ファイルシステムベースのルーティングを採用し、より直感的で強力な機能を提供します。

#### 基本的な構造

```
app/
├── layout.tsx          # ルートレイアウト（全ページ共通）
├── page.tsx           # ホームページ (/)
├── globals.css        # グローバルスタイル
├── demo/
│   └── carousel/
│       ├── page.tsx   # /demo/carousel ページ
│       ├── Clock.tsx  # コンポーネント
│       └── InfoBox.tsx # コンポーネント
└── favicon.ico        # ファビコン
```

#### App Router vs Pages Router

**Pages Router（従来の方式）**
```
pages/
├── index.tsx          # / (ホームページ)
├── about.tsx          # /about
├── users/
│   ├── index.tsx      # /users
│   └── [id].tsx       # /users/123
└── _app.tsx           # アプリ全体のラッパー
```

**App Router（新しい方式）**
```
app/
├── page.tsx           # / (ホームページ)
├── about/
│   └── page.tsx       # /about
├── users/
│   ├── page.tsx       # /users
│   └── [id]/
│       └── page.tsx   # /users/123
└── layout.tsx         # アプリ全体のレイアウト
```

### 🎯 主要なファイルと役割

#### 1. **layout.tsx** - レイアウトファイル
```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <h1>My App</h1>
        </header>
        <main>
          {children}
        </main>
        <footer>
          <p>&copy; 2024 My App</p>
        </footer>
      </body>
    </html>
  )
}
```

**特徴：**
- 全ページで共通のレイアウト
- HTMLの基本構造を定義
- メタデータの設定

#### 2. **page.tsx** - ページファイル
```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <p>This is the home page.</p>
    </div>
  )
}
```

**特徴：**
- 各ルートのメインページ
- デフォルトでサーバーコンポーネント
- SEOに最適化

#### 3. **loading.tsx** - ローディングUI
```tsx
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}
```

#### 4. **error.tsx** - エラーハンドリング
```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### 🎯 あなたのプロジェクトでのApp Router

#### プロジェクト構造の分析
```
src/app/
├── layout.tsx              # ルートレイアウト
├── page.tsx               # ホームページ
├── globals.css            # グローバルスタイル
└── demo/
    └── carousel/
        ├── page.tsx       # カルーセルデモページ
        ├── Clock.tsx      # 時計コンポーネント
        └── InfoBox.tsx    # 情報ボックスコンポーネント
```

#### サーバーコンポーネントとクライアントコンポーネント

**サーバーコンポーネント（デフォルト）**
```tsx
// サーバーコンポーネント（デフォルト）
export default function ServerComponent() {
  // サーバーサイドで実行
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**クライアントコンポーネント**
```tsx
'use client' // この行でクライアントコンポーネントに

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 🔧 実践的な使用例

#### 1. **動的ルーティング**
```tsx
// app/users/[id]/page.tsx
export default function UserPage({ params }: { params: { id: string } }) {
  return <div>User ID: {params.id}</div>;
}
```

#### 2. **メタデータAPI**
```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

### 🎯 まとめ

App Routerの利点：
- ✅ **直感的なファイル構造**: フォルダ名がURLになる
- ✅ **サーバーコンポーネント**: デフォルトでサーバーサイドレンダリング
- ✅ **メタデータAPI**: 動的なSEO最適化
- ✅ **レイアウトシステム**: 共通レイアウトの簡単な管理

プロジェクト構造を理解することで、効率的な開発と保守が可能になります！🚀 