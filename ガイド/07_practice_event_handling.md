# イベントハンドリング

### 🎯 イベントハンドリングとは？
ユーザーの操作（クリック、キー入力、ホイール操作など）に応じて実行される処理のことです。

### 📝 基本的なイベントハンドリング

#### 1. クリックイベント
```jsx
const handleClick = () => {
  console.log('Button clicked!');
};

return (
  <button onClick={handleClick}>
    Click me
  </button>
);
```

#### 2. キーボードイベント
```jsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    console.log('Enter key pressed');
  }
};

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 🎯 プロジェクトでのイベントハンドリング

#### ホイールイベント（カルーセル操作）
```jsx
const handleWheel = useCallback((e: WheelEvent) => {
  if (isAnimating) return; // アニメーション中は無視
  
  e.preventDefault(); // デフォルトのスクロールを防ぐ
  const delta = e.deltaY;
  
  if (delta > 0) {
    handleNext(); // 下にスクロール → 次のアイテム
  } else {
    handlePrev(); // 上にスクロール → 前のアイテム
  }
}, [isAnimating, handleNext, handlePrev]);
```

**解説：**
- `isAnimating`でアニメーション中の重複操作を防ぐ
- `e.preventDefault()`でページのスクロールを防ぐ
- `delta`の値でスクロール方向を判定

#### キーボードイベント（デスクトップ対応）
```jsx
useEffect(() => {
  if (!isMobile) {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }
}, [isMobile, handlePrev, handleNext]);
```

**解説：**
- モバイル以外でのみキーボードイベントを有効化
- 左右矢印キーでカルーセルを操作
- クリーンアップでイベントリスナーを削除

### 🔧 イベントハンドラーの実装パターン

#### 1. **インライン関数**
```jsx
<button onClick={() => setCount(count + 1)}>
  Increment
</button>
```

#### 2. **関数を定義**
```jsx
const handleIncrement = () => {
  setCount(count + 1);
};

<button onClick={handleIncrement}>
  Increment
</button>
```

#### 3. **useCallbackでメモ化**
```jsx
const handleIncrement = useCallback(() => {
  setCount(prev => prev + 1);
}, []);

<button onClick={handleIncrement}>
  Increment
</button>
```

### 🎯 イベントオブジェクトの活用

#### イベントの詳細情報を取得
```jsx
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const name = e.target.name;
  
  console.log(`Input ${name} changed to: ${value}`);
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

<input
  name="username"
  value={formData.username}
  onChange={handleInputChange}
/>
```

#### イベントの伝播を制御
```jsx
const handleParentClick = (e: React.MouseEvent) => {
  console.log('Parent clicked');
};

const handleChildClick = (e: React.MouseEvent) => {
  e.stopPropagation(); // 親への伝播を停止
  console.log('Child clicked');
};

return (
  <div onClick={handleParentClick}>
    <button onClick={handleChildClick}>
      Click me
    </button>
  </div>
);
```

### 🔍 イベントハンドリングのデバッグ

#### ログ出力
```jsx
const handleWheel = useCallback((e: WheelEvent) => {
  console.log('Wheel event:', {
    deltaX: e.deltaX,
    deltaY: e.deltaY,
    deltaZ: e.deltaZ,
    isAnimating
  });
  
  if (isAnimating) return;
  
  e.preventDefault();
  const delta = e.deltaY;
  
  if (delta > 0) {
    console.log('Scrolling down - next item');
    handleNext();
  } else {
    console.log('Scrolling up - previous item');
    handlePrev();
  }
}, [isAnimating, handleNext, handlePrev]);
```

#### イベントの可視化
```jsx
// 開発時のみ表示
{process.env.NODE_ENV === 'development' && (
  <div className="event-debug">
    <p>Last Event: {lastEvent}</p>
    <p>Event Count: {eventCount}</p>
  </div>
)}
```

### ⚠️ よくある問題と解決方法

#### 1. **イベントリスナーの重複**
```jsx
// 悪い例：重複してリスナーが追加される
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  // クリーンアップがない
}, []);

// 良い例：クリーンアップでリスナーを削除
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleKeyDown]);
```

#### 2. **クロージャの問題**
```jsx
// 悪い例：古い値が参照される
const handleClick = () => {
  setTimeout(() => {
    console.log(count); // 古い値
  }, 1000);
};

// 良い例：最新の値を参照
const handleClick = useCallback(() => {
  setTimeout(() => {
    setCount(prev => {
      console.log(prev); // 最新の値
      return prev + 1;
    });
  }, 1000);
}, []);
```

#### 3. **パフォーマンスの問題**
```jsx
// 悪い例：毎回新しい関数が作成される
const handleClick = () => {
  setCount(count + 1);
};

// 良い例：useCallbackでメモ化
const handleClick = useCallback(() => {
  setCount(prev => prev + 1);
}, []);
```

### 🎯 実践的なイベントハンドリング

#### タッチイベント（モバイル対応）
```jsx
const [touchStart, setTouchStart] = useState(0);
const [touchEnd, setTouchEnd] = useState(0);

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart(e.targetTouches[0].clientX);
};

const handleTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX);
};

const handleTouchEnd = () => {
  if (!touchStart || !touchEnd) return;
  
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50;
  const isRightSwipe = distance < -50;
  
  if (isLeftSwipe) {
    handleNext();
  } else if (isRightSwipe) {
    handlePrev();
  }
  
  setTouchStart(0);
  setTouchEnd(0);
};

return (
  <div
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
    {/* カルーセルの内容 */}
  </div>
);
```

### 📊 イベントハンドリングのベストプラクティス

| パターン | 用途 | パフォーマンス | 可読性 |
|----------|------|----------------|--------|
| インライン関数 | シンプルな処理 | ⭐⭐ | ⭐⭐⭐ |
| 関数定義 | 複雑な処理 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| useCallback | 最適化が必要 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 🎯 まとめ

イベントハンドリングのポイント：
- ✅ **適切なイベント選択**: 用途に合ったイベントを使用
- ✅ **パフォーマンス最適化**: useCallbackでメモ化
- ✅ **クリーンアップ**: イベントリスナーの適切な削除
- ✅ **ユーザビリティ**: 直感的な操作感を提供

注意点：
- 🔍 イベントの伝播を理解する
- 🔍 クロージャの問題に注意する
- 🔍 モバイルとデスクトップの両方に対応する

適切なイベントハンドリングにより、ユーザーフレンドリーなインターフェースを構築できます！🚀 