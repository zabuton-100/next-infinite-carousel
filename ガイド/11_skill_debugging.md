# デバッグとログ出力

### 🐛 デバッグとは？
プログラムの動作を確認し、問題を特定・修正するプロセスです。

### 📝 基本的なデバッグ手法

#### 1. **console.log**
```jsx
const handleNext = useCallback(() => {
  console.log('handleNext called', {
    currentIndex,
    isAnimating,
    emojiPairsArrayLength: emojiPairsArray.length
  });
  
  if (isAnimating) return;
  
  setIsAnimating(true);
  // ...
}, [isAnimating, emojiPairsArray.length]);
```

#### 2. **console.error**
```jsx
const validateState = () => {
  if (currentIndex < 0) {
    console.error('Current index cannot be negative:', currentIndex);
    setCurrentIndex(0);
  }
  
  if (itemWidth < 0) {
    console.error('Item width cannot be negative:', itemWidth);
    setItemWidth(0);
  }
};
```

#### 3. **console.warn**
```jsx
useEffect(() => {
  if (emojiPairsArray.length === 0) {
    console.warn('Emoji pairs array is empty');
  }
}, [emojiPairsArray.length]);
```

### 🎯 プロジェクトでのデバッグ実例

#### 状態変化の追跡
```jsx
useEffect(() => {
  console.log('State changed:', {
    currentIndex,
    isAnimating,
    itemWidth,
    emojiPairsArrayLength: emojiPairsArray.length
  });
}, [currentIndex, isAnimating, itemWidth, emojiPairsArray.length]);
```

#### イベントハンドラーのデバッグ
```jsx
const handleWheel = useCallback((e: WheelEvent) => {
  console.log('Wheel event:', {
    deltaX: e.deltaX,
    deltaY: e.deltaY,
    deltaZ: e.deltaZ,
    isAnimating
  });
  
  if (isAnimating) {
    console.log('Animation in progress, ignoring wheel event');
    return;
  }
  
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

### 🔍 高度なデバッグ手法

#### 1. **条件付きログ出力**
```jsx
const DEBUG = process.env.NODE_ENV === 'development';

const logState = (message, data) => {
  if (DEBUG) {
    console.log(`[Carousel] ${message}:`, data);
  }
};

// 使用例
logState('Current state', { currentIndex, isAnimating, itemWidth });
```

#### 2. **デバッグコンポーネント**
```jsx
const DebugPanel = ({ data }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="debug-panel" style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4>Debug Info</h4>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

// 使用例
<DebugPanel data={{
  currentIndex,
  isAnimating,
  itemWidth,
  screenSize: isMobile ? 'mobile' : 'desktop'
}} />
```

#### 3. **パフォーマンス測定**
```jsx
const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 16) { // 60fps = 16.67ms
        console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  });
};

// 使用例
const InfiniteCarousel = () => {
  usePerformanceMonitor('InfiniteCarousel');
  // コンポーネントの実装
};
```

### 🎯 エラーハンドリング

#### 1. **try-catch文**
```jsx
const handleAnimation = async () => {
  try {
    setIsAnimating(true);
    
    // アニメーション処理
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCurrentIndex(prev => prev + 1);
  } catch (error) {
    console.error('Animation error:', error);
    setIsAnimating(false);
  } finally {
    setIsAnimating(false);
  }
};
```

#### 2. **エラーバウンダリー**
```jsx
class CarouselErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Carousel error:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong with the carousel.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 🔧 デバッグツール

#### 1. **React Developer Tools**
```jsx
// コンポーネントにdisplayNameを設定
const InfiniteCarousel = ({ emojiPairsArray }) => {
  // 実装
};

InfiniteCarousel.displayName = 'InfiniteCarousel';
```

#### 2. **カスタムデバッグフック**
```jsx
const useDebugState = (state, label) => {
  useEffect(() => {
    console.log(`${label} changed:`, state);
  }, [state, label]);
};

// 使用例
const [currentIndex, setCurrentIndex] = useState(0);
useDebugState(currentIndex, 'Current Index');
```

#### 3. **ログレベル**
```jsx
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

const log = (level, message, data) => {
  if (level <= currentLogLevel) {
    const logMethod = level === LOG_LEVELS.ERROR ? console.error :
                     level === LOG_LEVELS.WARN ? console.warn :
                     console.log;
    logMethod(message, data);
  }
};

// 使用例
log(LOG_LEVELS.DEBUG, 'State update', { currentIndex, isAnimating });
log(LOG_LEVELS.ERROR, 'Animation failed', error);
```

### 📊 デバッグのベストプラクティス

#### 1. **構造化されたログ**
```jsx
const logCarouselEvent = (event, data) => {
  console.log(`[Carousel] ${event}`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

// 使用例
logCarouselEvent('wheel', { delta: e.deltaY, isAnimating });
logCarouselEvent('state_change', { currentIndex, isAnimating });
```

#### 2. **パフォーマンスログ**
```jsx
const logPerformance = (operation, startTime) => {
  const duration = performance.now() - startTime;
  console.log(`[Performance] ${operation} took ${duration.toFixed(2)}ms`);
};

// 使用例
const handleNext = () => {
  const startTime = performance.now();
  
  // 処理
  
  logPerformance('handleNext', startTime);
};
```

#### 3. **条件付きデバッグ**
```jsx
const DEBUG_CAROUSEL = process.env.NODE_ENV === 'development' && 
                      localStorage.getItem('debugCarousel') === 'true';

const debugLog = (...args) => {
  if (DEBUG_CAROUSEL) {
    console.log(...args);
  }
};
```

### 🎯 まとめ

デバッグのポイント：
- ✅ **適切なログレベル**: エラー、警告、情報、デバッグを区別
- ✅ **構造化されたログ**: 読みやすく、検索しやすい形式
- ✅ **パフォーマンス監視**: 処理時間の測定
- ✅ **エラーハンドリング**: 適切なエラー処理と復旧

注意点：
- 🔍 本番環境では不要なログを出力しない
- 🔍 機密情報をログに含めない
- 🔍 ログの量を適切に制御する

適切なデバッグ手法により、効率的に問題を特定・解決できます！🚀 