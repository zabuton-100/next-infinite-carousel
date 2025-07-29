# 実践的なコーディングパターン

### 🎯 コーディングパターンとは？
再利用可能で保守性の高いコードを書くための設計パターンです。

### 📝 主要なコーディングパターン

#### 1. **カスタムHookパターン**
```jsx
// useResponsiveCarouselCount.ts
export const useResponsiveCarouselCount = () => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const updateCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCount(1);
      } else if (width < 1024) {
        setCount(2);
      } else {
        setCount(3);
      }
    };

    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  return count;
};
```

**利点：**
- ロジックの再利用
- 関心の分離
- テスト容易性

#### 2. **Render Propsパターン**
```jsx
const CarouselContainer = ({ children, currentIndex, itemWidth }) => {
  const carouselStyle = {
    transform: `translateX(-${currentIndex * itemWidth}px)`,
    transition: 'transform 0.3s ease-in-out'
  };

  return (
    <div className="carousel-container" style={carouselStyle}>
      {children}
    </div>
  );
};

// 使用例
<CarouselContainer currentIndex={currentIndex} itemWidth={itemWidth}>
  {emojiPairsArray.map((pair, index) => (
    <CarouselItem key={index} pair={pair} />
  ))}
</CarouselContainer>
```

#### 3. **Higher-Order Component (HOC)パターン**
```jsx
const withAnimation = (WrappedComponent) => {
  return function WithAnimationComponent(props) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleAnimation = useCallback(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, []);

    return (
      <WrappedComponent
        {...props}
        isAnimating={isAnimating}
        onAnimation={handleAnimation}
      />
    );
  };
};

// 使用例
const AnimatedCarousel = withAnimation(InfiniteCarousel);
```

### 🎯 プロジェクトで使用されているパターン

#### 1. **初期化パターン**
```jsx
const [emojiPairsArray, setEmojiPairsArray] = useState<EmojiPair[]>(() => {
  // 関数を初期値として渡すことで、重い初期化処理を最適化
  if (initialEmojiPairsArray && initialEmojiPairsArray.length > 0) {
    return initialEmojiPairsArray;
  }
  return generateNewEmojiPairs();
});
```

**解説：**
- 関数を初期値として渡すことで、初回レンダリング時のみ実行
- 条件分岐で異なる初期値を設定
- パフォーマンス最適化

#### 2. **イベントハンドラーのメモ化**
```jsx
const handleNext = useCallback(() => {
  if (isAnimating) return;
  
  setIsAnimating(true);
  setTimeout(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      return nextIndex >= emojiPairsArray.length ? 0 : nextIndex;
    });
    setIsAnimating(false);
  }, 300);
}, [isAnimating, emojiPairsArray.length]);
```

**解説：**
- `useCallback`で関数をメモ化
- 依存配列で必要な値のみを監視
- 不要な再レンダリングを防止

#### 3. **条件付きレンダリングパターン**
```jsx
return (
  <div>
    {isMobile ? (
      <MobileCarousel items={items} />
    ) : (
      <DesktopCarousel items={items} />
    )}
  </div>
);
```

### 🔧 実践的なパターン

#### 1. **エラーバウンダリーパターン**
```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// 使用例
<ErrorBoundary>
  <InfiniteCarousel />
</ErrorBoundary>
```

#### 2. **Contextパターン**
```jsx
const CarouselContext = React.createContext();

const CarouselProvider = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const value = {
    currentIndex,
    setCurrentIndex,
    isAnimating,
    setIsAnimating
  };

  return (
    <CarouselContext.Provider value={value}>
      {children}
    </CarouselContext.Provider>
  );
};

const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within CarouselProvider');
  }
  return context;
};
```

#### 3. **Compound Componentパターン**
```jsx
const Carousel = ({ children, ...props }) => {
  return (
    <div className="carousel" {...props}>
      {children}
    </div>
  );
};

Carousel.Item = ({ children, ...props }) => {
  return (
    <div className="carousel-item" {...props}>
      {children}
    </div>
  );
};

Carousel.Navigation = ({ onNext, onPrev }) => {
  return (
    <div className="carousel-navigation">
      <button onClick={onPrev}>Previous</button>
      <button onClick={onNext}>Next</button>
    </div>
  );
};

// 使用例
<Carousel>
  <Carousel.Item>Item 1</Carousel.Item>
  <Carousel.Item>Item 2</Carousel.Item>
  <Carousel.Navigation onNext={handleNext} onPrev={handlePrev} />
</Carousel>
```

### 🎯 パフォーマンス最適化パターン

#### 1. **React.memo**
```jsx
const CarouselItem = React.memo(({ item, isActive }) => {
  return (
    <div className={`carousel-item ${isActive ? 'active' : ''}`}>
      {item.content}
    </div>
  );
});
```

#### 2. **useMemo**
```jsx
const carouselStyle = useMemo(() => ({
  transform: `translateX(-${currentIndex * itemWidth}px)`,
  transition: isAnimating ? 'transform 0.3s ease-in-out' : 'none'
}), [currentIndex, itemWidth, isAnimating]);
```

#### 3. **Lazy Loading**
```jsx
const LazyCarousel = React.lazy(() => import('./Carousel'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyCarousel />
    </Suspense>
  );
}
```

### 🔍 デバッグパターン

#### 1. **開発時のみのログ**
```jsx
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Carousel state:', {
      currentIndex,
      isAnimating,
      itemWidth
    });
  }
}, [currentIndex, isAnimating, itemWidth]);
```

#### 2. **デバッグコンポーネント**
```jsx
const DebugInfo = ({ data }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="debug-info">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
```

### 📊 パターンの比較

| パターン | 用途 | 複雑さ | 再利用性 |
|----------|------|--------|----------|
| カスタムHook | ロジックの分離 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Render Props | 柔軟なコンポーネント | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| HOC | 機能の追加 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Context | グローバル状態 | ⭐⭐ | ⭐⭐⭐ |

### 🎯 まとめ

コーディングパターンのポイント：
- ✅ **再利用性**: 同じロジックを複数箇所で使用
- ✅ **保守性**: 変更が容易で理解しやすい
- ✅ **テスト容易性**: 個別にテスト可能
- ✅ **パフォーマンス**: 最適化された実装

注意点：
- 🔍 過度な抽象化を避ける
- 🔍 プロジェクトの規模に適したパターンを選択
- 🔍 チームの理解度を考慮する

適切なコーディングパターンにより、保守性が高く、拡張可能なコードを書けます！🚀 