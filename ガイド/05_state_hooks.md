# Hooksの使い方

### 🎣 Hooksとは？
Hooksは、関数コンポーネントで状態やライフサイクルを管理するための機能です。

### 📌 主要なHooks

#### 1. `useState` - 状態管理
```jsx
const [currentIndex, setCurrentIndex] = useState(initialIndex);
const [isAnimating, setIsAnimating] = useState(false);
```

**解説：**
- `[状態, 状態を更新する関数]`の配列を返す
- 初期値を設定できる
- 状態が変更されると、コンポーネントが再レンダリングされる

#### 2. `useEffect` - 副作用の処理
```jsx
useEffect(() => {
  const updateWidth = () => {
    if (itemRef.current) {
      let width = itemRef.current.offsetWidth;
      width += SWIPER_CONFIG.spaceBetween;
      setItemWidth(width);
    }
  };
  updateWidth();
  window.addEventListener('resize', updateWidth);
  return () => window.removeEventListener('resize', updateWidth);
}, [isMobile, currentIndex]);
```

**解説：**
- コンポーネントのマウント、更新、アンマウント時に実行
- 第2引数の配列（依存配列）が変更された時に再実行
- クリーンアップ関数を返すことで、メモリリークを防ぐ

#### 3. `useRef` - DOM要素への参照
```jsx
const itemRef = useRef<HTMLDivElement>(null);
const carouselRef = useRef<HTMLDivElement>(null);
```

**解説：**
- DOM要素や値を保持するためのrefオブジェクト
- 値が変更されても再レンダリングされない
- DOM要素に直接アクセスできる

#### 4. `useCallback` - 関数のメモ化
```jsx
const handleWheel = useCallback((e: WheelEvent) => {
  if (isAnimating) return;
  
  e.preventDefault();
  const delta = e.deltaY;
  
  if (delta > 0) {
    handleNext();
  } else {
    handlePrev();
  }
}, [isAnimating, handleNext, handlePrev]);
```

**解説：**
- 関数をメモ化して、不要な再作成を防ぐ
- 依存配列の値が変更された時のみ新しい関数を作成
- パフォーマンス最適化に使用

### 🎯 カスタムHook

#### `useResponsiveCarouselCount` - レスポンシブ対応
```jsx
export const useResponsiveCarouselCount = () => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const updateCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCount(1); // モバイル
      } else if (width < 1024) {
        setCount(2); // タブレット
      } else {
        setCount(3); // デスクトップ
      }
    };

    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  return count;
};
```

**解説：**
- 画面サイズに応じてカルーセルの表示数を調整
- レスポンシブデザインの実装に使用
- 再利用可能なロジックをカプセル化

### 🔧 実践的な使用パターン

#### 1. **複数の状態を管理**
```jsx
const [currentIndex, setCurrentIndex] = useState(0);
const [isAnimating, setIsAnimating] = useState(false);
const [itemWidth, setItemWidth] = useState(0);
const [emojiPairsArray, setEmojiPairsArray] = useState<EmojiPair[]>([]);
```

#### 2. **条件付きのuseEffect**
```jsx
useEffect(() => {
  if (!isMobile) {
    // デスクトップでのみ実行
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }
}, [isMobile, handlePrev, handleNext]);
```

#### 3. **useRefとuseEffectの組み合わせ**
```jsx
const itemRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (itemRef.current) {
    const width = itemRef.current.offsetWidth;
    setItemWidth(width);
  }
}, [currentIndex]); // currentIndexが変更された時に再計算
```

### ⚠️ よくある落とし穴と解決方法

#### 1. **無限ループ**
```jsx
// 悪い例
useEffect(() => {
  setCount(count + 1); // 無限ループ
}, [count]);

// 良い例
useEffect(() => {
  setCount(prev => prev + 1); // 関数による更新
}, []); // 空の依存配列
```

#### 2. **クロージャの問題**
```jsx
// 悪い例
const handleClick = () => {
  setTimeout(() => {
    console.log(count); // 古い値が表示される
  }, 1000);
};

// 良い例
const handleClick = useCallback(() => {
  setTimeout(() => {
    setCount(prev => {
      console.log(prev); // 最新の値が表示される
      return prev + 1;
    });
  }, 1000);
}, []);
```

#### 3. **非同期処理**
```jsx
// 悪い例
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getData();
    setData(data); // コンポーネントがアンマウントされた後に実行される可能性
  };
  fetchData();
}, []);

// 良い例
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    const data = await api.getData();
    if (isMounted) {
      setData(data);
    }
  };
  
  fetchData();
  
  return () => {
    isMounted = false;
  };
}, []);
```

**setData(data) が処理されるタイミングの詳細：**

1. **コンポーネントマウント時**
   - `useEffect` が実行される
   - `isMounted = true` に設定
   - `fetchData()` が開始される

2. **API呼び出し中**
   - `await api.getData()` で非同期処理が実行中
   - この間にユーザーがページを離れたり、コンポーネントがアンマウントされる可能性がある

3. **API呼び出し完了時**
   - `api.getData()` が完了して `data` が取得される
   - この時点で `isMounted` の値をチェック

4. **setData(data) の実行判定**
   - `isMounted` が `true` の場合：`setData(data)` が実行される
   - `isMounted` が `false` の場合：`setData(data)` は実行されない

**具体的なシナリオ例：**

```jsx
// シナリオ1: 正常な場合
// 1. コンポーネントマウント → isMounted = true
// 2. API呼び出し開始（3秒かかると仮定）
// 3. 3秒後、API完了 → isMounted = true なので setData(data) 実行

// シナリオ2: ユーザーがページを離れた場合
// 1. コンポーネントマウント → isMounted = true
// 2. API呼び出し開始（3秒かかると仮定）
// 3. 2秒後にユーザーがページを離れる → クリーンアップ実行 → isMounted = false
// 4. 3秒後、API完了 → isMounted = false なので setData(data) は実行されない
```

**なぜこの処理が必要なのか：**
- コンポーネントがアンマウントされた後に `setData` を実行すると、React の警告が表示される
- メモリリークや予期しない動作を防ぐ
- ユーザーがページを離れた後に不要な処理を実行しない

### 🎯 プロジェクトでの使用例

#### カルーセルの状態管理
```jsx
// 現在のインデックス
const [currentIndex, setCurrentIndex] = useState(initialIndex);

// アニメーション状態
const [isAnimating, setIsAnimating] = useState(false);

// アイテムの幅
const [itemWidth, setItemWidth] = useState(0);

// エモジペアの配列
const [emojiPairsArray, setEmojiPairsArray] = useState<EmojiPair[]>(() => {
  if (initialEmojiPairsArray && initialEmojiPairsArray.length > 0) {
    return initialEmojiPairsArray;
  }
  return generateNewEmojiPairs();
});
```

#### イベントリスナーの管理
```jsx
useEffect(() => {
  const handleWheel = (e: WheelEvent) => {
    if (isAnimating) return;
    
    e.preventDefault();
    const delta = e.deltaY;
    
    if (delta > 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const carouselElement = carouselRef.current;
  if (carouselElement) {
    carouselElement.addEventListener('wheel', handleWheel, { passive: false });
  }

  return () => {
    if (carouselElement) {
      carouselElement.removeEventListener('wheel', handleWheel);
    }
  };
}, [isAnimating, handleNext, handlePrev]);
```

### 📊 Hooksの使用頻度と重要性

| Hook | 使用頻度 | 重要性 | 用途 |
|------|----------|--------|------|
| `useState` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 状態管理 |
| `useEffect` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 副作用処理 |
| `useRef` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | DOM参照 |
| `useCallback` | ⭐⭐⭐ | ⭐⭐⭐⭐ | パフォーマンス最適化 |
| `useMemo` | ⭐⭐ | ⭐⭐⭐ | 値のメモ化 |
| `useContext` | ⭐⭐ | ⭐⭐⭐ | コンテキスト |

### 🎯 まとめ

Hooksの利点：
- ✅ **関数コンポーネントで状態管理**: クラスコンポーネントが不要
- ✅ **ロジックの再利用**: カスタムHookでロジックを分離
- ✅ **型安全性**: TypeScriptとの相性が良い
- ✅ **学習コスト**: シンプルで理解しやすい

注意点：
- 🔍 ルールに従う（トップレベルでのみ呼び出し）
- 🔍 依存配列を適切に設定
- 🔍 クリーンアップを忘れずに実装

Hooksを適切に使用することで、保守性が高く、再利用可能なコンポーネントを構築できます！🚀 