# レスポンシブデザイン

### 🎯 レスポンシブデザインとは？
異なる画面サイズ（デスクトップ、タブレット、モバイル）に適応するデザインのことです。

### 📱 基本的なレスポンシブ対応

#### 1. CSS Media Queries
```css
/* モバイル（640px未満） */
@media (max-width: 639px) {
  .carousel-item {
    width: 100%;
  }
}

/* タブレット（640px〜1023px） */
@media (min-width: 640px) and (max-width: 1023px) {
  .carousel-item {
    width: 50%;
  }
}

/* デスクトップ（1024px以上） */
@media (min-width: 1024px) {
  .carousel-item {
    width: 33.333%;
  }
}
```

#### 2. Tailwind CSSのブレークポイント
```jsx
<div className="
  w-full          /* モバイル: 100% */
  md:w-1/2        /* タブレット: 50% */
  lg:w-1/3        /* デスクトップ: 33.333% */
">
  {/* コンテンツ */}
</div>
```

### 🎯 プロジェクトでのレスポンシブ対応

#### カスタムHook: `useResponsiveCarouselCount`
```jsx
export const useResponsiveCarouselCount = () => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const updateCount = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setCount(1); // モバイル: 1アイテム表示
      } else if (width < 1024) {
        setCount(2); // タブレット: 2アイテム表示
      } else {
        setCount(3); // デスクトップ: 3アイテム表示
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
- 画面サイズに応じてカルーセルの表示数を動的に調整
- `resize`イベントで画面サイズの変更を監視
- クリーンアップでメモリリークを防止

#### レスポンシブな幅計算
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

### 🔧 レスポンシブデザインの実装パターン

#### 1. **条件付きレンダリング**
```jsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 640);
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

return (
  <div>
    {isMobile ? (
      <MobileLayout />
    ) : (
      <DesktopLayout />
    )}
  </div>
);
```

#### 2. **動的なスタイル適用**
```jsx
const [screenSize, setScreenSize] = useState('desktop');

useEffect(() => {
  const updateScreenSize = () => {
    const width = window.innerWidth;
    if (width < 640) {
      setScreenSize('mobile');
    } else if (width < 1024) {
      setScreenSize('tablet');
    } else {
      setScreenSize('desktop');
    }
  };
  
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
  return () => window.removeEventListener('resize', updateScreenSize);
}, []);

const getCarouselStyle = () => {
  switch (screenSize) {
    case 'mobile':
      return { transform: `translateX(-${currentIndex * 100}%)` };
    case 'tablet':
      return { transform: `translateX(-${currentIndex * 50}%)` };
    case 'desktop':
      return { transform: `translateX(-${currentIndex * 33.333}%)` };
    default:
      return {};
  }
};
```

#### 3. **コンポーネントの分離**
```jsx
// モバイル用コンポーネント
const MobileCarousel = ({ items, currentIndex }) => {
  return (
    <div className="mobile-carousel">
      {items.map((item, index) => (
        <div key={index} className="w-full">
          {item}
        </div>
      ))}
    </div>
  );
};

// デスクトップ用コンポーネント
const DesktopCarousel = ({ items, currentIndex }) => {
  return (
    <div className="desktop-carousel">
      {items.map((item, index) => (
        <div key={index} className="w-1/3">
          {item}
        </div>
      ))}
    </div>
  );
};

// メインコンポーネント
const Carousel = ({ items, currentIndex }) => {
  const isMobile = useMediaQuery('(max-width: 639px)');
  
  return isMobile ? (
    <MobileCarousel items={items} currentIndex={currentIndex} />
  ) : (
    <DesktopCarousel items={items} currentIndex={currentIndex} />
  );
};
```

### 🎯 レスポンシブ対応のベストプラクティス

#### 1. **モバイルファースト設計**
```css
/* モバイルファースト */
.carousel-item {
  width: 100%; /* デフォルト（モバイル） */
}

/* タブレット以上 */
@media (min-width: 640px) {
  .carousel-item {
    width: 50%;
  }
}

/* デスクトップ以上 */
@media (min-width: 1024px) {
  .carousel-item {
    width: 33.333%;
  }
}
```

#### 2. **フレキシブルなグリッドシステム**
```jsx
const getGridCols = (screenSize) => {
  switch (screenSize) {
    case 'mobile': return 1;
    case 'tablet': return 2;
    case 'desktop': return 3;
    default: return 1;
  }
};

return (
  <div className={`grid grid-cols-${getGridCols(screenSize)} gap-4`}>
    {items.map((item, index) => (
      <div key={index} className="item">
        {item}
      </div>
    ))}
  </div>
);
```

#### 3. **画像の最適化**
```jsx
const ResponsiveImage = ({ src, alt }) => {
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={`${src}-large.jpg`} />
      <source media="(min-width: 640px)" srcSet={`${src}-medium.jpg`} />
      <img src={`${src}-small.jpg`} alt={alt} className="w-full h-auto" />
    </picture>
  );
};
```

### 🔍 レスポンシブデザインのデバッグ

#### 開発者ツールでの確認
```jsx
// 開発時のみ表示
{process.env.NODE_ENV === 'development' && (
  <div className="responsive-debug">
    <p>Screen Size: {screenSize}</p>
    <p>Window Width: {window.innerWidth}px</p>
    <p>Carousel Count: {carouselCount}</p>
    <p>Item Width: {itemWidth}px</p>
  </div>
)}
```

#### レスポンシブテスト
```jsx
const testResponsiveBehavior = () => {
  const testSizes = [
    { width: 375, expected: 'mobile' },
    { width: 768, expected: 'tablet' },
    { width: 1024, expected: 'desktop' }
  ];
  
  testSizes.forEach(({ width, expected }) => {
    // テストロジック
    console.log(`Testing ${width}px width - Expected: ${expected}`);
  });
};
```

### 📊 レスポンシブデザインの比較

| アプローチ | 実装難易度 | パフォーマンス | 保守性 |
|------------|------------|----------------|--------|
| CSS Media Queries | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| JavaScript | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| コンポーネント分離 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 🎯 まとめ

レスポンシブデザインのポイント：
- ✅ **モバイルファースト**: 小さい画面から設計を始める
- ✅ **段階的向上**: 画面サイズに応じて機能を追加
- ✅ **パフォーマンス**: 不要なリソースを避ける
- ✅ **ユーザビリティ**: 各デバイスで最適な体験を提供

注意点：
- 🔍 ブレークポイントを一貫して使用する
- 🔍 タッチ操作とマウス操作の違いを考慮する
- 🔍 画像やフォントサイズの最適化を行う

適切なレスポンシブデザインにより、すべてのデバイスで快適なユーザー体験を提供できます！🚀 