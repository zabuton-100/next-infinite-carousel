---
title: "🎠 ライブラリなしで無限カルーセルをCursorで作ってみた話（Next.js + React）"
emoji: "🎠"
type: "tech"
topics: ["React", "Next.js", "フロントエンド", "UI", "Hooks"]
published: false
---

# 🎠 ライブラリなしで無限カルーセルをCursorで作ってみた話（Next.js + React）

> Swiperを使えばすぐできる。でも「使わずに作ったら何が大変なのか？」を、**AIペアプログラミングツール「Cursor」**と一緒に試してみたら、学びが盛りだくさんだった。

---

## 🎯 この記事で伝えたいこと

- ライブラリなしで無限カルーセルを作るのは**意外と骨が折れる**！
- Next.js + React Hooksで**UIと状態管理を分離**する設計の実践例
- 自作による**細かいUX再現**や**パフォーマンス配慮**のリアル
- **Cursor（AIペアプログラミング）を活用した開発プロセスの実践例**
- 「使う前に作ってみる」ことで、ライブラリのありがたさも分かる

---

## 🤖 Cursorを使って開発した背景

本記事は、AIペアプログラミングツール「Cursor」を活用しながら、ライブラリなしで無限カルーセルを自作した開発体験をまとめたものです。Cursorを使うことで、設計や実装の壁打ち・リファクタ・技術調査・ドキュメント作成まで、AIと一緒に進める新しい開発スタイルを体験できました。

「AIと一緒に作ると、どこが楽で、どこが難しいのか？」という視点も交えて、実装の工夫や学びを紹介します。

---

## 📦 作ったもの

- フル自作の無限カルーセル
- Swiper風の挙動（スワイプ・オートスクロール・無限ループ）
- Tailwind CSS でデザイン調整
- 9種類の絵文字カードをスライド表示（内部的には30枚分ループ描画）
- 以下URLにて Vercel で公開中

https://next-infinite-carousel.vercel.app/demo/carousel

---

## 👨‍💻 コードはこちら

GitHub: [zabuton-100/next-infinite-carousel](https://github.com/zabuton-100/next-infinite-carousel)

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

また、ドラッグイベント（onMouseDown/onTouchStart など）を正しくリッスンしないと、そもそもスワイプ操作自体が反応しないことも実装を通じて実感しました。UIの直感的な操作性を担保するには、ユーザーの入力イベントを網羅的にハンドリングすることが重要だと学びました。

---

### 3. **flipアニメーションの工夫**

* 表→裏→表と切り替えるアニメーションを `flipInX` で表現
* インデックス単位で反転中かどうかをstateで管理

```tsx
const [flippedIndexes, setFlippedIndexes] = useState<Set<number>>(new Set());
```

👉 スライド中にだけ発火＆終わったら戻す、という**状態制御が重要**

なお、flipInXアニメーションの実装は、Owl Carouselのアニメーションデモ（[owl.carousel.js Animate Demo](https://owlcarousel2.github.io/OwlCarousel2/demos/animate.html)）を参考にしています。Owl Carouselでは`animateIn: 'flipInX'`のように指定することで、CSSアニメーションを簡単に適用できる仕組みがあり、その考え方やクラス設計を自作実装にも活かしました。

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

- 秒ズレが起きやすい `setInterval` の代わりに `requestAnimationFrame` を使って「高精度な現在時刻表示」を実現。

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

この実装では、`requestAnimationFrame` により毎フレーム（約16msごと）で現在時刻を監視し、`setDate(new Date())` で状態を更新しています。Reactの再レンダリングは状態が変化したときのみ発生するため、秒が切り替わったタイミングでのみ画面が再描画され、結果として「1秒ごと」に時計表示が更新されます。setIntervalと異なり、ブラウザの描画タイミングと同期するため、より滑らかで正確な秒更新が可能です。

---

## 🧠 ライブラリを使わなかったからこそ分かったこと

* 無限スクロールやflipアニメーションの裏側を理解できた
* 状態管理の難しさ（同期 vs 非同期、ref vs state）
* UIのちょっとした気遣いも実装コストがかかる
* Next.jsの**サーバー/クライアント分離の恩恵**を実感

---

## 🪝 この実装で使っているReact Hooksとその理由

本プロジェクトでは、Reactの標準HooksやカスタムHooksを積極的に活用しています。それぞれの用途と理由、そしてカルーセルのどの部分で使っているかは以下の通りです。

### useState
- `currentIndex`：現在表示中のスライド位置を管理
- `isAnimating`/`isAnimatingAll`：アニメーション中かどうかのフラグ
- `noTransition`：アニメーションを一時的に無効化するためのフラグ
- `itemWidth`/`translateX`：スライドの幅や位置の管理
- `flippedIndexes`/`flippingBackIndexes`：flipアニメーション中のカードインデックス管理
- `isAutoScrollStopped`：オートスクロールの一時停止状態
- `showCheck`：チェックアイコンの一時表示制御
- `lastScrollDirection`：直近のスクロール方向（左右・ボタン/スワイプ）

### useRef
- `carouselRef`/`itemRef`：カルーセル本体や各カードのDOM参照
- `isFirstRender`：初回描画かどうかの判定用フラグ
- `autoScrollIntervalRef`/`checkTimerRef`：setInterval/setTimeoutのID管理
- `dragState`：ドラッグ中の座標・状態（isDragging, startX, lastX, isTouch, startTranslateX など）

### useEffect
- スライド幅やウィンドウリサイズ時の再計算（`itemWidth`の更新）
- 初期位置セットや中央ジャンプ時のアニメーション制御
- 表示中の絵文字やタイトルの動的変更
- オートスクロールの開始・停止、クリーンアップ
- flipアニメーションのタイミング制御や、visibleなカードのログ出力

### useCallback
- `slideTo`：スライド移動処理（アニメーション・flip制御含む）
- `stopAutoScroll`：ユーザー操作時の自動スクロール停止
- `handleAutoScrollNext`：自動で次スライドに進める処理
- `triggerCheck`：チェックアイコンの一時表示処理

### カスタムHooks: useResponsiveCarouselCount
- 画面幅に応じて「表示枚数（visibleCount）」や「モバイル判定（isMobile）」を返すロジックをカスタムHooks化。
- カルーセル本体（InfiniteCarousel）で呼び出し、SP/PCでのUI切り替えやスライド数の自動調整に利用。
- このHooksを使うことで、レスポンシブ判定のロジックを他のコンポーネントでも再利用可能に。

---

## 🐣 Next.js・React初学者向け：実装のポイントと読み解きガイド（＋Cursor活用のヒント）

### 🖼️ スワイプ時の矢印画像表示の実装ポイント

スワイプやボタン操作をしたときに一瞬だけ表示される矢印アイコン（SVG）は、Reactの「状態管理（useState）」と「タイマー（setTimeout）」を組み合わせて実現しています。具体的には、`showCheck`という状態をtrueにすると矢印が表示され、0.7秒後に自動で非表示になります。また、スワイプやボタンの方向に応じて左右の矢印を切り替えているので、「どちらに動いたか」が直感的に分かるUIになっています。こうした一時的なフィードバックは、ユーザー体験を向上させる大事な工夫です。

### 🎨 Tailwind CSSを使った実装ポイント

このプロジェクトでは、CSSを直接書く代わりに「Tailwind CSS」というユーティリティファーストなCSSフレームワークを使っています。たとえば、`className="flex items-center justify-center w-[240px] h-80 ..."`のように、HTMLタグにたくさんのクラスを並べるだけで、レイアウトや色、余白、レスポンシブ対応、アニメーションまで細かく調整できます。これにより、デザインの試行錯誤や修正がとても速く、直感的にできるのが大きなメリットです。CSSファイルをほとんど書かずに済むので、初学者でもUIの調整がしやすくなります。

### 📖 InfiniteCarousel.tsxの読み解き方ガイド

このファイルは一見複雑ですが、次の順番で読み進めると理解しやすいです：

1. **props（emojiPairsArray）の受け取りと型定義**
   - どんなデータを受け取っているか、型（EmojiPair）を確認しましょう。
2. **カスタムHooksの呼び出し**
   - `useResponsiveCarouselCount`で画面幅ごとの表示枚数やモバイル判定を取得しています。
3. **useState/useRefで管理している状態・参照の一覧**
   - どんなUI状態やDOM参照があるか、変数名と用途をざっと把握しましょう。
4. **useEffect群の役割**
   - 初期化、リサイズ、タイトル変更、オートスクロール、アニメーション制御など、各副作用のタイミングと目的を確認します。
5. **コールバック関数（useCallback）**
   - `slideTo`や`stopAutoScroll`など、主要な操作ロジックの流れを追いましょう。
6. **ドラッグ・スワイプ・ホイール等のイベントハンドラ**
   - ユーザー操作にどう反応するか、イベントごとの処理を確認します。
7. **JSXの構造とTailwindクラス**
   - どのようにUIが組み立てられているか、各要素の役割やスタイリングを見てみましょう。
8. **アニメーションやflipの制御ロジック**
   - flipInXや一時的なSVG表示など、動きのある部分の状態遷移を追うと理解が深まります。

この順番で「データ→状態→副作用→操作→UI構造→アニメーション」と段階的に読み解くことで、全体像と細部のつながりがスムーズに理解できます。分からない部分は、まず「どんな状態（useState）やイベント（onClick, onTouchStartなど）があるか」を探してみるのがおすすめです。

---

## 🧰 Cursor × AI開発 実践ガイドも公開中

本記事の実装や開発プロセスで得たAI活用の知見・ノウハウは、下記Zenn記事でも詳しくまとめています。AIペアプログラミングやCursor活用に興味のある方はぜひご参照ください。

🧰 [Cursor × AI開発 実践ガイド](https://zenn.dev/zabuton100/articles/7b7d1268c2d384)

---

## ✍ 最後に

「ただのカルーセル」に見えて、実は**状態管理・アニメーション・レスポンシブ**と、実践的なフロント技術が詰まっています。

「ライブラリなしで作ってみる」ことで、Reactの地力や設計の引き出しを増やす練習にもなるので、ぜひチャレンジしてみてください！
