---
title: "🎠 ライブラリなしで無限カルーセルを作ってみた話（Next.js + React）"
emoji: "🎠"
type: "tech"
topics: ["React", "Next.js", "フロントエンド", "UI", "Hooks"]
published: false
---

# 🚀 ライブラリなしで無限カルーセルを作ってみた話（Next.js + React）

> Swiperを使えばすぐできる。でも「使わずに作ったら何が大変なのか？」を試してみたら、学びが盛りだくさんだった。

---

## 🎯 この記事で伝えたいこと

- ライブラリなしで無限カルーセルを作るのは**意外と骨が折れる**！
- Next.js + React Hooksで**UIと状態管理を分離**する設計の実践例
- 自作による**細かいUX再現**や**パフォーマンス配慮**のリアル
- 「使う前に作ってみる」ことで、ライブラリのありがたさも分かる

---

## 📦 作ったもの

- フル自作の無限カルーセル
- Swiper風の挙動（スワイプ・オートスクロール・無限ループ）
- Tailwind CSS でデザイン調整
- 9種類の絵文字カードをスライド表示（内部的には30枚分ループ描画）
- 以下URLにて Vercel で公開中

https://next-infinite-carousel.vercel.app/demo/carousel

---

## 🛠 技術スタック

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- emoji-dictionary / unicode-emoji-json（絵文字名・カテゴリ取得）

※外部のUIライブラリ（Swiper等）は未使用

---

## 💡 実装のポイントと工夫

### 1. **無限スクロールの実現方法**

表示＋先読み用の絵文字配列（9個）を常に更新しながら、「中央（30枚中の10番目）に戻すジャンプ」を挟むことで見た目上の無限ループを再現しています。

```ts
// 例: 配列の端に来たらアニメーションを一時無効化して中央にジャンプ
function slideTo(index: number) {
  if (index < threshold) {
    jumpToCenter();
  } else {
    setCurrentIndex(index);
  }
}
````

👉 **疑似的に「無限に見える」ようにするのが難しい！**

---

### 2. **スワイプ＆ドラッグ対応**

* マウス/タッチの座標差分でスライド方向を判定
* `useRef`でDOMへのアクセスとdrag状態を管理
* スライド距離が閾値を超えたら移動、未満ならスナップバック

👉 PointerEventの取り扱いやイベントキャンセルが地味に面倒！

---

### 3. **flipアニメーションの工夫**

* 表→裏→表と切り替えるアニメーションを `flipInX` で表現
* インデックス単位で反転中かどうかをstateで管理

```tsx
const [flippedIndexes, setFlippedIndexes] = useState<Set<number>>(new Set());
```

👉 スライド中にだけ発火＆終わったら戻す、という**状態制御が重要**

---

### 4. **オートスクロールの一時停止ロジック**

* 初期状態では1.5秒ごとに自動スライド
* ユーザーが操作すると**即座にオートスクロールを止める**
* 一度止めたら**以降は自動再開しない**

👉 こういう「人間らしい挙動」の再現も、自作だと全部書く必要あり！

---

### 5. **UI最適化とレスポンシブ対応**

* モバイル・PCで表示枚数を切り替え（`window.innerWidth`、**現状はどちらも3枚表示**）
* `useEffect`でリサイズ時に再計算
* TailwindのユーティリティでCSSも柔軟に変更

---

## 🔍 学びポイント（React / Next.js）

### useRef × useEffect の地味だけど重要な使い方

* ドラッグ中のイベント管理は `ref` でDOMとフラグを保持
* 状態更新は遅延するため、**リアルタイムな制御はref必須**

---

### サーバー/クライアントコンポーネントの責務分離

* サーバー側：初期データ（絵文字）を生成
* クライアント側：UI描画＆ユーザー操作

```tsx
// page.tsx
import CarouselServer from "@/components/CarouselServer";
export default function Page() {
  return <CarouselServer />;
}
```

```tsx
// CarouselServer.tsx（Server Component）
return <InfiniteCarousel emojiPairsArray={arr} />
```

👉 Next.jsの設計思想に合った、**責務分離の実践例**！

---

### requestAnimationFrameの活用

秒ズレが起きやすい `setInterval` の代わりに `requestAnimationFrame` を使って「高精度な現在時刻表示」を実現。

```tsx
useEffect(() => {
  const updateTime = () => {
    setDate(new Date());
    requestAnimationFrame(updateTime);
  };
  updateTime();
  return () => cancelAnimationFrame(updateTime);
}, []);
```

---

## 🧠 ライブラリを使わなかったからこそ分かったこと

* 無限スクロールやflipアニメーションの裏側を理解できた
* 状態管理の難しさ（同期 vs 非同期、ref vs state）
* UIのちょっとした気遣いも実装コストがかかる
* Next.jsの**サーバー/クライアント分離の恩恵**を実感

---

## 👨‍💻 コードはこちら

GitHub: [zabuton-100/next-infinite-carousel](https://github.com/zabuton-100/next-infinite-carousel)

---

## 🧰 Cursor × AI開発 実践ガイドも公開中

本記事の実装や開発プロセスで得たAI活用の知見・ノウハウは、下記Zenn記事でも詳しくまとめています。AIペアプログラミングやCursor活用に興味のある方はぜひご参照ください。

🧰 [Cursor × AI開発 実践ガイド](https://zenn.dev/zabuton100/articles/7b7d1268c2d384)

---

## ✍ 最後に

「ただのカルーセル」に見えて、実は**状態管理・アニメーション・レスポンシブ**と、実践的なフロント技術が詰まっています。

「ライブラリなしで作ってみる」ことで、Reactの地力や設計の引き出しを増やす練習にもなるので、ぜひチャレンジしてみてください！
