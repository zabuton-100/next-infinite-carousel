# アニメーションとトランジション

### 🎬 アニメーションとは？
UI要素の状態変化を滑らかに表現する技術です。

### 🎯 プロジェクトでのアニメーション

#### カルーセルのスライドアニメーション
```jsx
const carouselStyle = {
  transform: `translateX(-${currentIndex * itemWidth}px)`,
  transition: isAnimating ? 'transform 0.3s ease-in-out' : 'none'
};

return (
  <div 
    ref={carouselRef}
    className="carousel-container"
    style={carouselStyle}
  >
    {/* カルーセルのアイテム */}
  </div>
);
```

**解説：**
- `transform: translateX()` で水平方向の移動
- `transition` でアニメーションの時間とイージングを設定
- `isAnimating` でアニメーション中かどうかを制御

### 🎭 CSSトランジションの詳細

#### 1. **基本的なトランジション**
```css
.carousel-item {
  transition: all 0.3s ease-in-out;
}

.carousel-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

#### 2. **プロパティ別のトランジション**
```css
.carousel-item {
  transition: 
    transform 0.3s ease-in-out,
    opacity 0.2s ease-out,
    box-shadow 0.3s ease-in-out;
}
```

#### 3. **カスタムイージング**
```css
.carousel-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 🎯 アニメーション制御の実装

#### アニメーション状態の管理
```jsx
const [isAnimating, setIsAnimating] = useState(false);

const handleNext = useCallback(() => {
  if (isAnimating) return; // アニメーション中は無視
  
  setIsAnimating(true); // アニメーション開始
  
  setTimeout(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      return nextIndex >= emojiPairsArray.length ? 0 : nextIndex;
    });
    setIsAnimating(false); // アニメーション終了
  }, 300); // トランジション時間と同期
}, [isAnimating, emojiPairsArray.length]);
```

#### noTransitionの切り替え
```jsx
const carouselStyle = {
  transform: `translateX(-${currentIndex * itemWidth}px)`,
  transition: noTransition ? 'none' : 'transform 0.3s ease-in-out'
};
```

**noTransitionを切り替える必要性：**
- **初期化時**: ページ読み込み時にアニメーションなしで正しい位置に配置
- **リサイズ時**: 画面サイズ変更時にスムーズに位置調整
- **プログラム制御**: JavaScriptで直接位置を設定する場合

### 🎮 イベントリスナーの制御

#### onWheelイベントをリッスンする理由
```jsx
useEffect(() => {
  const handleWheel = (e: WheelEvent) => {
    if (isAnimating) return; // アニメーション中は無視
    
    e.preventDefault(); // デフォルトのスクロールを防ぐ
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

**onWheelをリッスンする理由：**
1. **直感的な操作**: マウスホイールでカルーセルを操作
2. **デフォルト動作の制御**: ページスクロールを防ぎ、カルーセル操作に専念
3. **レスポンシブ対応**: デスクトップでの主要な操作方法
4. **ユーザビリティ**: キーボードやタッチ以外の操作手段を提供

### 🎨 高度なアニメーション

#### 1. **フェードイン/アウト**
```jsx
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  setIsVisible(true);
}, []);

return (
  <div 
    className={`fade-in ${isVisible ? 'visible' : ''}`}
    style={{
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.5s ease-in-out'
    }}
  >
    {/* コンテンツ */}
  </div>
);
```

#### 2. **スケールアニメーション**
```jsx
const [isExpanded, setIsExpanded] = useState(false);

return (
  <div 
    className="scale-animation"
    style={{
      transform: isExpanded ? 'scale(1.1)' : 'scale(1)',
      transition: 'transform 0.3s ease-in-out'
    }}
    onClick={() => setIsExpanded(!isExpanded)}
  >
    {/* コンテンツ */}
  </div>
);
```

#### 3. **ローテーションアニメーション**
```jsx
const [rotation, setRotation] = useState(0);

const handleRotate = () => {
  setRotation(prev => prev + 90);
};

return (
  <div 
    style={{
      transform: `rotate(${rotation}deg)`,
      transition: 'transform 0.5s ease-in-out'
    }}
    onClick={handleRotate}
  >
    {/* コンテンツ */}
  </div>
);
```

### 🎯 アニメーションのパフォーマンス最適化

#### 1. **GPUアクセラレーション**
```css
.carousel-container {
  transform: translateX(-100px);
  will-change: transform; /* GPUアクセラレーションを有効化 */
}
```

#### 2. **requestAnimationFrame**
```jsx
const animate = (startTime) => {
  const progress = (Date.now() - startTime) / 300; // 300ms
  
  if (progress < 1) {
    const currentPosition = startPosition + (endPosition - startPosition) * progress;
    setCurrentPosition(currentPosition);
    requestAnimationFrame(() => animate(startTime));
  } else {
    setCurrentPosition(endPosition);
    setIsAnimating(false);
  }
};
```

#### 3. **アニメーションの最適化**
```jsx
// 悪い例：レイアウトを変更するプロパティ
const badStyle = {
  width: isExpanded ? '200px' : '100px', // レイアウト変更
  height: isExpanded ? '200px' : '100px' // レイアウト変更
};

// 良い例：GPUアクセラレーション可能なプロパティ
const goodStyle = {
  transform: isExpanded ? 'scale(2)' : 'scale(1)', // GPUアクセラレーション
  opacity: isExpanded ? 1 : 0.5 // GPUアクセラレーション
};
```

### 🔍 アニメーションのデバッグ

#### アニメーション状態の可視化
```jsx
// 開発時のみ表示
{process.env.NODE_ENV === 'development' && (
  <div className="animation-debug">
    <p>Is Animating: {isAnimating ? 'Yes' : 'No'}</p>
    <p>Current Index: {currentIndex}</p>
    <p>Item Width: {itemWidth}px</p>
    <p>Transform: translateX(-{currentIndex * itemWidth}px)</p>
  </div>
)}
```

#### アニメーションのログ出力
```jsx
useEffect(() => {
  console.log('Animation state changed:', {
    isAnimating,
    currentIndex,
    itemWidth,
    transform: `translateX(-${currentIndex * itemWidth}px)`
  });
}, [isAnimating, currentIndex, itemWidth]);
```

### 📊 アニメーションの比較

| アプローチ | パフォーマンス | 実装難易度 | ブラウザ対応 |
|------------|----------------|------------|--------------|
| CSS Transition | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| CSS Animation | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| JavaScript | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Web Animations API | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

### 🎯 まとめ

アニメーションのポイント：
- ✅ **ユーザビリティ**: 直感的で自然な操作感
- ✅ **パフォーマンス**: GPUアクセラレーションの活用
- ✅ **制御性**: アニメーション状態の適切な管理
- ✅ **一貫性**: 統一されたアニメーション設計

注意点：
- 🔍 アニメーション中の重複操作を防ぐ
- 🔍 パフォーマンスに影響するプロパティを避ける
- 🔍 アクセシビリティを考慮する

適切なアニメーションにより、魅力的で使いやすいインターフェースを構築できます！🚀 