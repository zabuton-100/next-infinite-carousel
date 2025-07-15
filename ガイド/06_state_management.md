# 状態管理の理解

### 🔄 状態の種類

#### 1. ローカル状態（useState）
```jsx
const [currentIndex, setCurrentIndex] = useState(initialIndex);
const [isAnimating, setIsAnimating] = useState(false);
```

#### 2. 複雑な状態（オブジェクト）
```jsx
const [emojiPairsArray, setEmojiPairsArray] = useState<EmojiPair[]>(() => {
  // 初期化ロジック
  if (initialEmojiPairsArray && initialEmojiPairsArray.length > 0) {
    return initialEmojiPairsArray;
  }
  // 新規生成ロジック
  return generateNewEmojiPairs();
});
```

**解説：**
- 関数を初期値として渡すことで、重い初期化処理を最適化
- 条件分岐で異なる初期値を設定

### 🎯 状態更新のパターン

#### 1. 直接更新
```jsx
setCurrentIndex(currentIndex + 1);
```

#### 2. 関数による更新
```jsx
setCurrentIndex(prev => prev + 1);
```

#### 3. 配列の更新
```jsx
// 新しい要素を追加
setEmojiPairsArray(prev => [...prev, newPair]);

// 特定の要素を更新
setEmojiPairsArray(prev => 
  prev.map((pair, index) => 
    index === targetIndex ? updatedPair : pair
  )
);

// 要素を削除
setEmojiPairsArray(prev => 
  prev.filter((_, index) => index !== targetIndex)
);
```

#### 4. オブジェクトの更新
```jsx
// プロパティを更新
setUser(prev => ({
  ...prev,
  name: newName,
  email: newEmail
}));

// ネストしたオブジェクトの更新
setUser(prev => ({
  ...prev,
  profile: {
    ...prev.profile,
    avatar: newAvatar
  }
}));
```

### 🔧 状態管理のベストプラクティス

#### 1. **状態の正規化**
```jsx
// 悪い例：ネストした状態
const [users, setUsers] = useState([
  {
    id: 1,
    name: 'Alice',
    posts: [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' }
    ]
  }
]);

// 良い例：正規化された状態
const [users, setUsers] = useState([
  { id: 1, name: 'Alice' }
]);
const [posts, setPosts] = useState([
  { id: 1, userId: 1, title: 'Post 1' },
  { id: 2, userId: 1, title: 'Post 2' }
]);
```

#### 2. **状態の分割**
```jsx
// 悪い例：大きな状態オブジェクト
const [state, setState] = useState({
  currentIndex: 0,
  isAnimating: false,
  itemWidth: 0,
  emojiPairsArray: [],
  user: { name: '', email: '' },
  settings: { theme: 'light', language: 'ja' }
});

// 良い例：関連する状態を分割
const [currentIndex, setCurrentIndex] = useState(0);
const [isAnimating, setIsAnimating] = useState(false);
const [itemWidth, setItemWidth] = useState(0);
const [emojiPairsArray, setEmojiPairsArray] = useState([]);
const [user, setUser] = useState({ name: '', email: '' });
const [settings, setSettings] = useState({ theme: 'light', language: 'ja' });
```

#### 3. **初期化の最適化**
```jsx
// 重い初期化処理
const [emojiPairsArray, setEmojiPairsArray] = useState<EmojiPair[]>(() => {
  // この関数は初回レンダリング時のみ実行される
  return generateNewEmojiPairs();
});
```

### 🔄 状態の依存関係と更新タイミング

#### 1. **状態の依存関係**
```jsx
const [currentIndex, setCurrentIndex] = useState(0);
const [itemWidth, setItemWidth] = useState(0);

// currentIndexが変更された時にitemWidthを再計算
useEffect(() => {
  if (itemRef.current) {
    const width = itemRef.current.offsetWidth;
    setItemWidth(width);
  }
}, [currentIndex]);
```

#### 2. **状態のバッチ処理**
```jsx
// React 18では自動的にバッチ処理される
const handleNext = () => {
  setCurrentIndex(prev => prev + 1);
  setIsAnimating(true);
  // これらは1回のレンダリングで処理される
};
```

#### 3. **状態の更新順序**
```jsx
const handleAnimation = () => {
  setIsAnimating(true);
  
  // アニメーション完了後に状態を更新
  setTimeout(() => {
    setCurrentIndex(prev => prev + 1);
    setIsAnimating(false);
  }, 300);
};
```

### 🐛 状態管理のデバッグ

#### 1. **ログ出力**
```jsx
useEffect(() => {
  console.log('Current Index:', currentIndex);
  console.log('Is Animating:', isAnimating);
  console.log('Item Width:', itemWidth);
}, [currentIndex, isAnimating, itemWidth]);
```

#### 2. **状態の可視化**
```jsx
// 開発時のみ表示
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    <p>Current Index: {currentIndex}</p>
    <p>Is Animating: {isAnimating ? 'Yes' : 'No'}</p>
    <p>Item Width: {itemWidth}px</p>
  </div>
)}
```

#### 3. **状態の検証**
```jsx
const validateState = () => {
  if (currentIndex < 0) {
    console.error('Current index cannot be negative');
    setCurrentIndex(0);
  }
  
  if (itemWidth < 0) {
    console.error('Item width cannot be negative');
    setItemWidth(0);
  }
};

useEffect(() => {
  validateState();
}, [currentIndex, itemWidth]);
```

### 🎯 プロジェクトでの状態管理

#### カルーセルの状態構造
```jsx
// 現在の表示位置
const [currentIndex, setCurrentIndex] = useState(initialIndex);

// アニメーション状態
const [isAnimating, setIsAnimating] = useState(false);

// アイテムの幅（レスポンシブ対応）
const [itemWidth, setItemWidth] = useState(0);

// エモジペアの配列
const [emojiPairsArray, setEmojiPairsArray] = useState<EmojiPair[]>(() => {
  if (initialEmojiPairsArray && initialEmojiPairsArray.length > 0) {
    return initialEmojiPairsArray;
  }
  return generateNewEmojiPairs();
});
```

#### 状態更新の流れ
```jsx
// 1. ユーザーがホイールを回す
const handleWheel = useCallback((e: WheelEvent) => {
  if (isAnimating) return; // アニメーション中は無視
  
  e.preventDefault();
  const delta = e.deltaY;
  
  if (delta > 0) {
    handleNext(); // 次のアイテムへ
  } else {
    handlePrev(); // 前のアイテムへ
  }
}, [isAnimating, handleNext, handlePrev]);

// 2. 次のアイテムへの移動
const handleNext = useCallback(() => {
  if (isAnimating) return;
  
  setIsAnimating(true); // アニメーション開始
  
  setTimeout(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      // 無限ループの実装
      return nextIndex >= emojiPairsArray.length ? 0 : nextIndex;
    });
    setIsAnimating(false); // アニメーション終了
  }, 300);
}, [isAnimating, emojiPairsArray.length]);
```

#### 状態の同期
```jsx
// レスポンシブ対応での状態同期
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
}, [isMobile, currentIndex]); // 依存関係を明確に
```

### 📊 状態管理のパターン比較

| パターン | 用途 | 複雑さ | パフォーマンス |
|----------|------|--------|----------------|
| `useState` | ローカル状態 | ⭐ | ⭐⭐⭐⭐⭐ |
| `useReducer` | 複雑な状態 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Context API | グローバル状態 | ⭐⭐ | ⭐⭐⭐ |
| Redux | 大規模アプリ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

### 🎯 まとめ

状態管理のポイント：
- ✅ **適切な粒度**: 関連する状態をまとめる
- ✅ **不変性**: 状態を直接変更せず、新しい値で更新
- ✅ **予測可能性**: 状態の変更が予測可能であること
- ✅ **デバッグ容易性**: 状態の変化を追跡できること

注意点：
- 🔍 状態の依存関係を明確にする
- 🔍 不要な再レンダリングを避ける
- 🔍 状態の初期化を最適化する

適切な状態管理により、保守性が高く、予測可能なアプリケーションを構築できます！🚀 