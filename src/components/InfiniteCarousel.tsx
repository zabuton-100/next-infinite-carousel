"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useResponsiveCarouselCount } from "./useResponsiveCarouselCount";
// @ts-expect-error: 型定義が無いためanyでimport
import emojiDictionary from "emoji-dictionary";
import unicodeEmojiJsonRaw from "unicode-emoji-json";
const unicodeEmojiJson = unicodeEmojiJsonRaw as Record<string, { group?: string }>;

// pastelColors: カードの背景色として使うパステルカラーの配列
const pastelColors = [
  '#ffd1dc', '#ffe4b5', '#b5ead7', '#c7ceea', '#fdfd96', '#baffc9', '#bae1ff', '#fff1ba', '#ffb7b2', '#e2f0cb',
  '#ffe0f0', '#ffe5ec', '#e0bbff', '#d0f4de', '#f1f7b5', '#b5ead7', '#b5d8ff', '#f7cac9', '#f6eac2', '#e2f0cb',
  '#f3ffe3', '#e3f6fd', '#fff5e1', '#f9e2ae', '#e4f9f5', '#f7f6e7', '#fbe7c6', '#e2ece9', '#f6dfeb',
];
// darkColors: 裏面や補色用のダークカラー配列
const darkColors = [
  '#22223b', '#4a4e69', '#232946', '#1a1a2e', '#2d3142', '#222831', '#393e46', '#212121', '#343a40', '#2c2c54',
  '#1b1b2f', '#162447', '#1f4068', '#283655', '#3a3a3a', '#232931', '#393e46', '#222f3e', '#2d3436', '#353b48',
  '#2f3640', '#1e272e', '#485460', '#3d3d5c', '#2c3e50', '#22313f', '#1a1a40', '#232b2b', '#2e2e38', '#22223b',
];

// 配列からランダムに1つ値を取得するユーティリティ関数
function getRandomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ランダムな絵文字を取得する関数
function getRandomEmoji() {
  const ranges = [
    [0x1F300, 0x1F5FF], [0x1F600, 0x1F64F], [0x1F680, 0x1F6FF], [0x1F700, 0x1F77F], [0x1F780, 0x1F7FF],
    [0x1F800, 0x1F8FF], [0x1F900, 0x1F9FF], [0x1FA00, 0x1FAFF], [0x2600, 0x26FF], [0x2700, 0x27BF],
  ];
  let emoji = "";
  let tries = 0;
  while (!emoji || !emojiDictionary.getName(emoji)) {
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    const codePoint = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    emoji = String.fromCodePoint(codePoint);
    tries++;
    if (tries > 20) break;
  }
  return emoji;
}

// 既に使われている絵文字と被らないようにランダムな絵文字ペアを生成
function getUniqueRandomEmojiPair(existingEmojis: Set<string>) {
  let emoji = getRandomEmoji();
  let tries = 0;
  while (existingEmojis.has(emoji) && tries < 50) {
    emoji = getRandomEmoji();
    tries++;
  }
  return {
    front: {
      emoji,
      color: getRandomFromArray(pastelColors),
    },
    back: {
      emoji: getRandomEmoji(),
      color: getRandomFromArray(darkColors),
    },
  };
}

// Swiper風の設定オブジェクト（カルーセルの動作を制御）
const SWIPER_CONFIG = {
  speed: 300, // アニメーション速度（ms）
  slidesPerView: 3, // 表示スライド数
  slidesPerGroup: 3, // 一度に移動するスライド数
  spaceBetween: 16, // スライド間の距離
  loop: true, // 無限ループ
  loopAdditionalSlides: 1, // 追加スライド数
  grabCursor: true, // グラブカーソル
  resistance: true, // 抵抗
  resistanceRatio: 0.85, // 抵抗比率
  threshold: 5, // スワイプ閾値
  longSwipes: true, // 長いスワイプ
  longSwipesRatio: 0.5, // 長いスワイプ比率
  longSwipesMs: 300, // 長いスワイプ時間
  followFinger: true, // 指に追従
  preventClicks: true, // クリック防止
  preventClicksPropagation: true, // クリック伝播防止
  roundLengths: true, // 長さを丸める
  watchSlidesProgress: true, // スライド進行状況監視
  centeredSlides: false, // 中央寄せスライド
};

// ログ出力用のタイムスタンプを生成する関数
function getLogTimestamp() {
  const d = new Date();
  const pad = (n: number, z = 2) => ('00' + n).slice(-z);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${('00' + d.getMilliseconds()).slice(-3)}`;
}

// 補色（反対色）を計算する関数。背景色に対して文字色を決めるのに使う
function getComplementaryColor(hex: string) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;
  return (
    '#' +
    compR.toString(16).padStart(2, '0') +
    compG.toString(16).padStart(2, '0') +
    compB.toString(16).padStart(2, '0')
  );
}

// スネークケースの文字列をタイトルケースに変換する関数
function toTitleCaseFromSnake(str: string) {
  return str
    .toLowerCase()
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

// --- 型定義 ---
type EmojiPair = {
  front: { emoji: string; color: string };
  back: { emoji: string; color: string };
};
export interface InfiniteCarouselProps {
  emojiPairsArray?: EmojiPair[];
}

// --- メインのカルーセルコンポーネント ---
const InfiniteCarousel: React.FC<InfiniteCarouselProps> = ({ emojiPairsArray: initialEmojiPairsArray }) => {
  // 1. 画面幅に応じた表示枚数やモバイル判定を取得（この後の状態初期化やレイアウト分岐に使う）
  const { isMobile, visibleCount } = useResponsiveCarouselCount();

  // 2. カルーセルに表示する絵文字ペア配列の状態を初期化
  //   - propsで初期値が来ていればそれを使う
  //   - なければランダム生成（この後の描画やスライド移動で参照）
  const preloadCount = 6;
  const [emojiPairsArray, setEmojiPairsArray] = useState<EmojiPair[]>(() => {
    // propsから初期値が来ていればそれを使う
    if (initialEmojiPairsArray && initialEmojiPairsArray.length > 0) {
      return initialEmojiPairsArray;
    }
    // なければ新規生成
    const visibleCountInit = 3; // デフォルト
    const emojiArrayLength = Math.max(visibleCountInit + preloadCount, 10 * 3); // PC時はtotalSlides(30)以上
    const set = new Set<string>();
    const arr = [];
    for (let i = 0; i < emojiArrayLength; i++) {
      const pair = getUniqueRandomEmojiPair(set);
      set.add(pair.front.emoji);
      arr.push(pair);
    }
    return arr;
  });

  // 3. カルーセルの動作に関わる各種状態を初期化
  //   - これらの状態はイベントやuseEffectで更新され、描画やアニメーションに反映される
  const imageCount = 10; // 1セットあたりのカード枚数
  const slidesPerGroup = isMobile ? 1 : SWIPER_CONFIG.slidesPerGroup; // 1回の移動枚数
  const totalSlides = 10 * 3; // 3セット分のスライド数
  const initialIndex = 10; // 初期表示位置（中央付近）

  // --- 状態の前後関係 ---
  // currentIndex: 現在の表示インデックス（ボタン・スワイプ・自動スクロールで変化）
  //   → 変化後、translateXやアニメーション状態も更新される
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  // isAnimating: アニメーション中かどうか（スライド移動時にtrue、完了後false）
  const [isAnimating, setIsAnimating] = useState(false);
  // noTransition: CSSトランジションを無効化するか（ドラッグ中true、終了後false）
  const [noTransition, setNoTransition] = useState(false);
  // itemWidth: 画像1枚分の横幅（リサイズや初期化時に更新）
  const [itemWidth, setItemWidth] = useState(0);
  // translateX: カルーセル全体の横方向の移動量（currentIndexやドラッグで変化）
  const [translateX, setTranslateX] = useState(0);

  // --- useRefの前後関係 ---
  // carouselRef, itemRef: DOM要素参照（itemWidth取得やドラッグ判定で使う）
  // isFirstRender: 初回描画かどうか（初期位置セット時に利用）
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // flippedIndexes: 裏返しアニメーション中のカードインデックス
  // flippingBackIndexes: 明るい面に戻すアニメーション用インデックス
  // visibleCountNum: 表示枚数（visibleCountの数値版）
  const [flippedIndexes, setFlippedIndexes] = useState<Set<number>>(new Set());
  const visibleCountNum = visibleCount as number;
  const [flippingBackIndexes, setFlippingBackIndexes] = useState<Set<number>>(new Set());

  // --- ページタイトル ---
  const PAGE_TITLE = "Emoji Carousel";

  // --- useEffect: グローバルイベントリスナーのクリーンアップ ---
  // 前: ドラッグ中にmousemove/upイベントをwindowに追加することがある
  // 後: アンマウント時に必ず削除（メモリリーク防止）
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleDragMove as EventListener);
      window.removeEventListener('mouseup', handleDragEnd as EventListener);
    };
  }, []);

  // --- useEffect: 画像1枚分の横幅を取得し、リサイズ時も更新 ---
  // 前: itemRefがセットされている必要あり
  // 後: itemWidthが変わると初期位置やtranslateXの計算に使われる
  useEffect(() => {
    const updateWidth = () => {
      if (itemRef.current) {
        let width = itemRef.current.offsetWidth;
        width += SWIPER_CONFIG.spaceBetween; // スライド間の余白も加算
        setItemWidth(width);
        // 後: itemWidthが変わると初期位置セットのuseEffectが再実行される
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isMobile, currentIndex]);

  // --- useEffect: 初期位置を中央にセット ---
  // 前: itemWidth, isMobile, visibleCountが揃っている必要あり
  // 後: currentIndex, translateX, noTransitionが初期化される
  useEffect(() => {
    // isMobile, visibleCount, itemWidth が揃ったタイミングで初期位置をセット
    if (itemWidth === 0 || isMobile === undefined || visibleCount === undefined) return;
    if (isFirstRender.current) {
      setNoTransition(true);
      // SPはimageCount, PCはimageCount-Math.floor(visibleCount/2)
      const centerOffset = Math.floor((visibleCount as number) / 2);
      const startIndex = isMobile ? imageCount : imageCount - centerOffset;
      // SP時はパディング分+16pxを加味して中央寄せ
      const paddingOffset = isMobile ? 16 : 0;
      setCurrentIndex(startIndex);
      setTranslateX(-itemWidth * startIndex + paddingOffset);
      console.log('[FirstRender:共通] translateX set to', -itemWidth * startIndex + paddingOffset, ', currentIndex set to', startIndex);
      // 次のtickでアニメーションONに戻す
      const timer = setTimeout(() => {
        setNoTransition(false);
        isFirstRender.current = false;
        console.log('[FirstRender] noTransition:false - アニメーションON');
      }, 20);
      return () => clearTimeout(timer);
    } else {
      // SP時はパディング分+16pxを加味して中央寄せ
      const paddingOffset = isMobile ? 16 : 0;
      setTranslateX(-itemWidth * currentIndex + paddingOffset);
      console.log('[NotFirstRender:PC]', { translateX: -itemWidth * currentIndex + paddingOffset, itemWidth });
    }
  }, [itemWidth, isMobile, visibleCount, currentIndex]);

  // --- useEffect: 表示中のカード情報をログ出力 ---
  // 前: currentIndexやvisibleCountNumが変わった直後
  // 後: デバッグ用ログ出力のみ
  useEffect(() => {
    if (isMobile === undefined || visibleCount === undefined) return;
    const centerOffset = Math.floor(visibleCountNum / 2);
    const centerIndex = currentIndex + centerOffset;
    const shownIndex = ((centerIndex - 1 + imageCount) % imageCount) + 1;
    const visibleCards = [];
    for (let i = 0; i < visibleCountNum; i++) {
      const cardIndex = currentIndex + i;
      const cardElementIndex = ((cardIndex - 1 + imageCount) % imageCount) + 1;
      visibleCards.push(cardElementIndex);
    }
    const cardCount = visibleCards.length;
    console.log(getLogTimestamp(), '表示状態:', { shownIndex, cardCount, visibleCards, isMobile, translateX, noTransition });
  }, [currentIndex, visibleCountNum, imageCount, isMobile, visibleCount, noTransition, translateX]);

  // --- useEffect: 表示中・preload絵文字のconsole出力 ---
  // 前: currentIndexやvisibleCountが変わった直後
  // 後: デバッグ用ログ出力のみ
  useEffect(() => {
    if (isMobile === undefined || visibleCount === undefined) return;
    const emojis: string[] = [];
    if (isMobile) {
      // 中央をcurrentIndex、その前後1枚ずつ
      for (let i = -1; i <= 1; i++) {
        const idx = (currentIndex + i + emojiPairsArray.length) % emojiPairsArray.length;
        emojis.push(emojiPairsArray[idx].front.emoji);
      }
    } else {
      // PCはcurrentIndexからvisibleCount分
      for (let i = 0; i < visibleCount; i++) {
        const idx = (currentIndex + i) % emojiPairsArray.length;
        emojis.push(emojiPairsArray[idx].front.emoji);
      }
    }
    // preload分
    let preload: string[] = [];
    if (isMobile) {
      // 左右1枚ずつ（visibleの外側）
      const leftIdx = (currentIndex - 2 + emojiPairsArray.length) % emojiPairsArray.length;
      const rightIdx = (currentIndex + 2) % emojiPairsArray.length;
      preload = [emojiPairsArray[leftIdx].front.emoji, emojiPairsArray[rightIdx].front.emoji];
    } else {
      // 左右3枚ずつ
      const lefts = [];
      const rights = [];
      for (let i = 1; i <= 3; i++) {
        lefts.push(emojiPairsArray[(currentIndex - i + emojiPairsArray.length) % emojiPairsArray.length].front.emoji);
        rights.push(emojiPairsArray[(currentIndex + visibleCount - 1 + i) % emojiPairsArray.length].front.emoji);
      }
      preload = [...lefts.reverse(), ...rights];
    }
    console.log('[Carousel] 表示中:', emojis);
    console.log('[Carousel] preload:', preload);

    // DOM上に描画している全カードのindex・絵文字・visible状態を出力
    const domCardStates = Array.from({ length: (isMobile ? 10 * 3 : 10 * 3) }).map((_, idx) => {
      const emojiIdx = idx % emojiPairsArray.length;
      const emoji = emojiPairsArray[emojiIdx].front.emoji;
      // visible判定: currentIndex <= idx < currentIndex + visibleCount
      let isVisible = false;
      if (isMobile) {
        // SPはcurrentIndex-1〜currentIndex+1がvisible
        isVisible = (idx >= currentIndex - 1) && (idx <= currentIndex + 1);
      } else {
        // PCはcurrentIndex〜currentIndex+visibleCount-1がvisible
        isVisible = (idx >= currentIndex) && (idx < currentIndex + visibleCount);
      }
      return { idx, emoji, isVisible };
    });
    console.log('[Carousel] DOM上のカード一覧:', domCardStates);
    const visibleCards = domCardStates.filter(card => card.isVisible);
    if (visibleCards.length === 0) {
      console.warn('[Carousel][警告] DOM上でvisibleなカードが0枚です！', { currentIndex, visibleCount, isMobile });
    }
  }, [currentIndex, visibleCount, isMobile, emojiPairsArray, noTransition, translateX]);

  // --- useEffect: 表示中の絵文字でページタイトルを動的に変更 ---
  // 前: currentIndexやvisibleCountが変わった直後
  // 後: document.titleが更新される
  useEffect(() => {
    if (isMobile === undefined || visibleCount === undefined) return;
    const emojis: string[] = [];
    if (isMobile) {
      for (let i = -1; i <= 1; i++) {
        const idx = (currentIndex + i + emojiPairsArray.length) % emojiPairsArray.length;
        emojis.push(emojiPairsArray[idx].front.emoji);
      }
    } else {
      for (let i = 0; i < visibleCount; i++) {
        const idx = (currentIndex + i) % emojiPairsArray.length;
        emojis.push(emojiPairsArray[idx].front.emoji);
      }
    }
    document.title = `Emoji ( ${emojis.join(' - ')} )`;
  }, [currentIndex, visibleCount, isMobile, emojiPairsArray]);

  // --- useEffect: 初期タイトルをh1と同じにする ---
  // 前: マウント直後
  // 後: document.titleが初期化される
  useEffect(() => {
    document.title = PAGE_TITLE;
  }, []);

  // --- 自動スクロール関連 ---
  // isAutoScrollStopped: 自動スクロールが止まっているか（ユーザー操作や初期化でtrueになる）
  // autoScrollIntervalRef: setIntervalのIDを保持（自動スクロールの開始・停止で使う）
  // stopAutoScroll: ユーザー操作時に呼ばれ、自動スクロールを止める
  // handleAutoScrollNext: 一定間隔で次のスライドへ進む
  // useEffect: isAutoScrollStoppedがfalseの間だけ自動スクロールを維持
  // 自動スクロールが停止しているかどうか
  const [isAutoScrollStopped, setIsAutoScrollStopped] = useState(false);
  // setIntervalのIDを保持
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 自動スクロールを停止する関数
  const stopAutoScroll = useCallback(() => {
    if (!isAutoScrollStopped) {
      setIsAutoScrollStopped(true);
      console.log('[Carousel] 自動スクロール停止');
    }
  }, [isAutoScrollStopped]);

  // --- スライドを指定インデックスに移動する関数 ---
  // アニメーションや裏返しアニメーションも制御
  const slideTo = useCallback((target: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setNoTransition(false);
    setIsAnimatingAll(true);
    setFlippedIndexes(prev => {
      const newSet = new Set(prev);
      if (isMobile) {
        for (let i = -1; i <= 1; i++) {
          newSet.add(currentIndex + i);
        }
      } else {
        for (let i = 0; i < visibleCountNum; i++) {
          newSet.add(currentIndex + i);
        }
      }
      return newSet;
    });
    setTimeout(() => {
      setIsAnimatingAll(false);
      const diff = target - currentIndex;
      const newIndex = currentIndex + diff;
      const wrappedIndex = ((newIndex % totalSlides) + totalSlides) % totalSlides;
      const paddingOffset = isMobile ? 16 : 0;
      const nextTranslateX = -itemWidth * wrappedIndex + paddingOffset;
      if (newIndex >= totalSlides || newIndex < 0) {
        setNoTransition(true);
        setCurrentIndex(wrappedIndex);
        setTranslateX(nextTranslateX);
        setTimeout(() => {
          setNoTransition(false);
        }, 20);
      } else {
        setCurrentIndex(wrappedIndex);
        setTranslateX(nextTranslateX);
      }
      setTimeout(() => {
        setIsAnimating(false);
        setIsAnimatingAll(false);
        // --- 明るい面に戻す前にアニメーション用stateに追加 ---
        setFlippingBackIndexes(prev => {
          const newSet = new Set(prev);
          if (isMobile) {
            for (let i = -1; i <= 1; i++) {
              newSet.add(wrappedIndex + i);
            }
          } else {
            for (let i = 0; i < visibleCountNum; i++) {
              newSet.add(wrappedIndex + i);
            }
          }
          return newSet;
        });
        // 明るい面に戻す
        setFlippedIndexes(prev => {
          const newSet = new Set(prev);
          if (isMobile) {
            for (let i = -1; i <= 1; i++) {
              newSet.delete(wrappedIndex + i);
            }
          } else {
            for (let i = 0; i < visibleCountNum; i++) {
              newSet.delete(wrappedIndex + i);
            }
          }
          return newSet;
        });
        // 一定時間後にアニメーション用stateから削除
        setTimeout(() => {
          setFlippingBackIndexes(prev => {
            const newSet = new Set(prev);
            if (isMobile) {
              for (let i = -1; i <= 1; i++) {
                newSet.delete(wrappedIndex + i);
              }
            } else {
              for (let i = 0; i < visibleCountNum; i++) {
                newSet.delete(wrappedIndex + i);
              }
            }
            return newSet;
          });
        }, 500); // flipInXアニメーション時間
      }, 500);
    }, 500);
    // スライドが末尾に到達しそうな場合は新しい絵文字を追加
    if (target + slidesPerGroup > emojiPairsArray.length - preloadCount) {
      setEmojiPairsArray(prev => {
        const set = new Set(prev.map(p => p.front.emoji));
        const newArr = [...prev];
        for (let i = 0; i < slidesPerGroup; i++) {
          const pair = getUniqueRandomEmojiPair(set);
          set.add(pair.front.emoji);
          newArr.push(pair);
        }
        return newArr;
      });
    }
  }, [isAnimating, itemWidth, isMobile, currentIndex, visibleCountNum, totalSlides, emojiPairsArray, preloadCount, slidesPerGroup]);

  // --- 自動スクロールで次のスライドへ進む関数 ---
  const handleAutoScrollNext = useCallback(() => {
    // isAnimating中はスキップ
    if (!isAnimating) {
      // stopAutoScrollは呼ばない（自動スクロールからは止めない）
      const next = currentIndex + slidesPerGroup;
      slideTo(next);
    }
  }, [currentIndex, isAnimating, slideTo, slidesPerGroup]);

  // --- useEffect: 一定間隔で自動スクロール ---
  useEffect(() => {
    if (isAutoScrollStopped || isMobile === undefined || visibleCount === undefined) return;
    autoScrollIntervalRef.current = setInterval(() => {
      handleAutoScrollNext();
    }, 1500); // 1.5秒ごとに自動でスライド
    console.log('[Carousel] 自動スクロール開始');
    return () => {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    };
  }, [isAutoScrollStopped, isMobile, visibleCount, handleAutoScrollNext]);

  // --- 全カードがアニメーション中かどうかの状態 ---
  const [isAnimatingAll, setIsAnimatingAll] = useState(false);

  // --- ドラッグ・スワイプ操作のための一時的な状態 ---
  // dragState: ドラッグ開始時にセットし、move/endで参照
  // 前: handleDragStartでセット
  // 後: handleDragMove/handleDragEndで参照・更新
  const dragState = useRef({
    isDragging: false, // ドラッグ中かどうか
    startX: 0,         // ドラッグ開始時のX座標
    lastX: 0,          // 直近のX座標
    isTouch: false,    // タッチ操作かどうか
    startTranslateX: 0, // ドラッグ開始時のtranslateX
  });

  // --- SVGチェックマーク表示用の状態 ---
  // showCheck: チェックマーク表示中か
  // checkTimerRef: setTimeoutのIDを保持
  // triggerCheck: チェックマークを一瞬表示（ドラッグやボタン操作時に呼ばれる）
  // useEffect: アンマウント時にタイマーをクリア
  const [showCheck, setShowCheck] = useState(false);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- SVGチェックマークを一瞬表示する関数 ---
  const triggerCheck = useCallback(() => {
    setShowCheck(true);
    console.log('[CheckCircle] 表示開始');
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => {
      setShowCheck(false);
      console.log('[CheckCircle] 表示終了');
    }, 700); // 0.7秒表示
  }, []);

  // --- useEffect: SVGチェックマークのクリーンアップ ---
  useEffect(() => {
    return () => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
  }, []);

  // --- ドラッグ・スワイプ開始時の処理 ---
  // 前: ユーザーがマウスダウン/タッチスタートした直後
  // 後: isDraggingがtrueになり、mousemove/upイベントが発火したらhandleDragMove/handleDragEndが呼ばれる
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    // ユーザーが操作したら自動スクロールを止める
    stopAutoScroll();
    // タッチ操作の場合はチェックマークを表示
    if ('touches' in e) {
      triggerCheck();
    }
    // ドラッグ状態をセット
    dragState.current.isDragging = true;
    dragState.current.isTouch = 'touches' in e;
    dragState.current.startX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    dragState.current.lastX = dragState.current.startX;
    dragState.current.startTranslateX = translateX;
    setNoTransition(true); // ドラッグ中はアニメーション無効
    // マウス操作の場合はグローバルイベントリスナーを追加
    if (!('touches' in e)) {
      window.addEventListener('mousemove', handleDragMove as EventListener);
      window.addEventListener('mouseup', handleDragEnd as EventListener);
    }
  };

  // --- ドラッグ・スワイプ中の処理 ---
  // 前: handleDragStartでisDraggingがtrueになっている
  // 後: マウス/タッチが動くたびにtranslateXが更新され、カルーセルがリアルタイムで動く
  const handleDragMove = (e: TouchEvent | MouseEvent | React.TouchEvent | React.MouseEvent) => {
    if (!dragState.current.isDragging) return;
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else if ('clientX' in e) {
      clientX = e.clientX;
    } else {
      return;
    }
    dragState.current.lastX = clientX;
    // ドラッグ距離分だけカルーセルを動かす
    const dx = clientX - dragState.current.startX;
    setTranslateX(dragState.current.startTranslateX + dx);
  };

  // --- ドラッグ・スワイプ終了時の処理 ---
  // 前: handleDragMoveでisDraggingがtrueの状態でマウス/タッチを離す
  // 後: 一定距離以上ならスライド移動、足りなければ元の位置に戻す。isDragging=falseに
  const handleDragEnd = () => {
    if (!dragState.current.isDragging) return;
    const dx = dragState.current.lastX - dragState.current.startX;
    dragState.current.isDragging = false;
    setNoTransition(false); // アニメーションを有効に戻す
    // マウス操作の場合はグローバルイベントリスナーを削除
    if (!dragState.current.isTouch) {
      window.removeEventListener('mousemove', handleDragMove as EventListener);
      window.removeEventListener('mouseup', handleDragEnd as EventListener);
    }
    // 一定距離以上ドラッグしたらスライドを移動
    const threshold = isMobile ? 10 : 20;
    if (dx > threshold) {
      setLastScrollDirection('swipe-left');
      triggerCheck();
      slideTo(currentIndex - slidesPerGroup);
    } else if (dx < -threshold) {
      setLastScrollDirection('swipe-right');
      triggerCheck();
      slideTo(currentIndex + slidesPerGroup);
    } else {
      // 距離が足りなければ元の位置に戻す
      setTranslateX(dragState.current.startTranslateX);
    }
  };

  // --- ホイール（トラックパッド横スクロール）対応 ---
  // 前: ユーザーがトラックパッドで横スクロールした直後
  // 後: 一定量以上ならスライド移動、currentIndexが変わる
  const handleWheel = (e: React.WheelEvent) => {
    // 横スクロール量が一定以上ならスライド
    const wheelThreshold = isMobile ? 10 : 20;
    if (Math.abs(e.deltaX) > wheelThreshold && !isAnimating) {
      stopAutoScroll();
      setLastScrollDirection(e.deltaX > 0 ? 'swipe-right' : 'swipe-left');
      triggerCheck();
      if (e.deltaX > 0) {
        slideTo(currentIndex + slidesPerGroup);
      } else {
        slideTo(currentIndex - slidesPerGroup);
      }
    }
  };

  // --- スクロール方向を管理する状態 ---
  // lastScrollDirection: 直近のスワイプ/ボタン操作の方向（SVG表示やアニメーションで利用）
  const [lastScrollDirection, setLastScrollDirection] = useState<'swipe-left' | 'swipe-right' | 'button-left' | 'button-right'>('swipe-right');

  // --- レンダリング部分 ---
  // 前: 各状態がセットされていること
  // 後: JSXでカルーセル・カード・ボタンなどが描画され、ユーザー操作で状態が変化
  if (isMobile === undefined || visibleCount === undefined) {
    // 画面幅の判定が終わるまでスケルトンスクリーンを表示
    return (
      <div className="w-full min-h-screen flex flex-col items-center bg-gray-100 pt-4 md:pt-12">
        <div className="w-full max-w-6xl px-0 md:px-0">
          <div className="flex items-center justify-center space-x-1 md:space-x-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[240px] md:w-[300px] h-80 md:h-120 mx-2 p-4 flex flex-col items-center justify-center bg-gray-300 rounded-lg shadow-lg border-2 border-gray-200 animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4" />
                <div className="w-2/3 h-6 bg-gray-200 rounded mb-2" />
                <div className="w-1/2 h-4 bg-gray-200 rounded mb-1" />
                <div className="w-1/3 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // カルーセル全体のコンテナクラス（SP/PCで幅やパディングを調整）
  const carouselContainerClass = isMobile
    ? "w-full max-w-[320px] mx-auto overflow-hidden px-4 relative"
    : "w-full max-w-[944px] mx-auto overflow-hidden relative";

  // カルーセル本体のスタイル（横幅・transform・アニメーション）
  const carouselStyle = {
    width: (isMobile ? 240 : 300) * totalSlides + SWIPER_CONFIG.spaceBetween * 2 * totalSlides,
    transform: `translateX(${translateX}px)` ,
    transition: noTransition ? 'none' : `transform ${SWIPER_CONFIG.speed}ms cubic-bezier(0.32, 0.72, 0, 1)`,
    willChange: 'transform',
  };

  // カード1枚のクラス（SP/PCでサイズや装飾を分岐）
  const getCardClass = () => {
    return isMobile
      ? "flex-shrink-0 w-[240px] h-80 mx-2 p-4 flex flex-col items-center justify-center bg-gray-700 rounded-lg shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 relative"
      : "flex-shrink-0 w-[300px] h-120 mx-2 p-4 flex flex-col items-center justify-center bg-gray-700 rounded-lg shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 relative";
  };

  // ナビゲーションボタンのクラス（SP/PCで見た目を分岐）
  const navButtonClass = isMobile
    ? "absolute top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-lg border-2 border-gray-200 hover:border-blue-300 flex-shrink-0 w-10 h-10 flex items-center justify-center text-xl p-0.5 active:scale-95 transition-all"
    : "p-1 md:p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors border-2 border-gray-200 hover:border-blue-300 flex-shrink-0 text-xs md:text-base z-10";
  const navButtonLeftStyle = isMobile ? { left: 0 } : {};
  const navButtonRightStyle = isMobile ? { right: 0 } : {};

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-100 pt-4 md:pt-12">
      <div className="w-full max-w-6xl px-0 md:px-0">
        <div className={isMobile ? "relative flex items-center justify-center" : "flex items-center space-x-1 md:space-x-4"}>
          {/* 左ボタン */}
          {isMobile ? (
            <button
              onClick={() => { stopAutoScroll(); slideTo(currentIndex - slidesPerGroup); setLastScrollDirection('button-left'); triggerCheck(); }}
              className={navButtonClass}
              style={navButtonLeftStyle}
              aria-label="前へ"
              disabled={isAnimating}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* 左向き矢印に戻す */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => { stopAutoScroll(); slideTo(currentIndex - slidesPerGroup); setLastScrollDirection('button-left'); triggerCheck(); }}
              className={navButtonClass}
              aria-label="前へ"
              disabled={isAnimating}
            >
              <svg className="w-3 h-3 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* 左向き矢印に戻す */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {/* カルーセルコンテナ */}
          <div
            className={carouselContainerClass}
          >
            <div
              ref={carouselRef}
              className="flex cursor-grab active:cursor-grabbing select-none touch-none"
              style={carouselStyle}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onMouseDown={handleDragStart}
              onWheel={handleWheel} // 追加
            >
              {Array.from({ length: totalSlides }).map((_, idx) => {
                // idxをimageCountで割った余りでemojiPairsArrayから取得
                const emojiIdx = idx % emojiPairsArray.length;
                const pair = emojiPairsArray[emojiIdx];
                // flipInX中かどうか
                const isFlipped = flippedIndexes.has(idx);
                // 表裏データ
                const side = isFlipped ? pair.back : pair.front;
                const emojiName = emojiDictionary.getName(side.emoji);
                const emojiCategory = unicodeEmojiJson[side.emoji]?.group || "Other";
                let cardClass = getCardClass();
                if (isAnimatingAll) cardClass += ' slideOutDown flipInX';
                // 明るい面に戻す時もflipInXを付与
                if (flippingBackIndexes.has(idx)) cardClass += ' flipInX';
                // 補色を計算
                const textColor = getComplementaryColor(side.color);
                return (
                  <div
                    key={idx}
                    ref={idx === currentIndex ? itemRef : undefined}
                    className={cardClass}
                    style={{ backgroundColor: side.color }}
                  >
                    {/* --- SVG表示 --- */}
                    {showCheck && (
                      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-green-500 animate-fade-pop" style={{opacity: 0.1}}>
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="white" fillOpacity="0.7"/>
                          {lastScrollDirection === 'button-left' ? (
                            // ボタン左: 右向き
                            <path d="M24 32h16M36 24l8 8-8 8" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          ) : lastScrollDirection === 'button-right' ? (
                            // ボタン右: 左向き
                            <path d="M40 32H24M28 24l-8 8 8 8" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          ) : lastScrollDirection === 'swipe-left' ? (
                            // スワイプ左: 右向き（スクロール方向と揃える）
                            <path d="M24 32h16M36 24l8 8-8 8" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          ) : (
                            // スワイプ右: 左向き（スクロール方向と揃える）
                            <path d="M40 32H24M28 24l-8 8 8 8" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          )}
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-lg md:text-xl font-bold px-1 md:px-3 py-0.5 md:py-2 rounded-full">
                      {(idx % 10) + 1}
                    </div>
                    <div className={isMobile ? "flex items-center justify-center w-[240px] h-[320px] text-8xl flex-col" : "flex items-center justify-center w-[300px] h-[480px] text-9xl flex-col"}>
                      <span style={{ color: textColor }}>{side.emoji}</span>
                      <span
                        className={isMobile ? "text-base mt-2 break-words w-full text-center" : "text-lg mt-4 break-words w-full text-center"}
                        style={{ color: textColor }}
                      >
                        {emojiName ? toTitleCaseFromSnake(emojiName) : ""}
                      </span>
                      {/* カテゴリ表示（小さめ） */}
                      <span
                        className={isMobile ? "text-sm mt-1 w-full text-center" : "text-base mt-2 w-full text-center"}
                        style={{ color: textColor }}
                      >
                        ({emojiCategory})
                      </span>
                    </div>
                    <div className="mt-1 md:mt-4 text-xs md:text-lg text-gray-200 font-medium text-center px-1">
                      {(idx % 10) + 1}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* SP時のみ右ボタンをカルーセル内に絶対配置 */}
            {isMobile && (
              <button
                onClick={() => { stopAutoScroll(); slideTo(currentIndex + slidesPerGroup); setLastScrollDirection('button-right'); triggerCheck(); }}
                className={navButtonClass}
                style={navButtonRightStyle}
                aria-label="次へ"
                disabled={isAnimating}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {/* 右向き矢印に戻す */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          {/* 右ボタン（PC時のみ） */}
          {!isMobile && (
            <button
              onClick={() => { stopAutoScroll(); slideTo(currentIndex + slidesPerGroup); setLastScrollDirection('button-right'); triggerCheck(); }}
              className={navButtonClass}
              aria-label="次へ"
              disabled={isAnimating}
            >
              <svg className="w-3 h-3 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* 右向き矢印に戻す */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        {/* 現在のインデックス表示 */}
        <div className="flex flex-col items-center justify-center mt-4 md:mt-6">
          <span
            style={{
              fontSize: '1.0rem', // ここを1.1remから1.0remに変更
              fontWeight: 'bold',
              marginBottom: '1.2rem',
              display: 'flex',
              background: 'linear-gradient(135deg, #f8fafc 60%, #e2e8f0 100%)',
              color: '#222',
              borderRadius: '1.2rem',
              boxShadow: '0 6px 24px 0 rgba(0,0,0,0.18), 0 2px 0 #fff inset, 0 1.5px 0 #e0e0e0 inset',
              border: '2px solid #d1d5db',
              padding: '0.18em 0.8em',
              position: 'relative',
              overflow: 'hidden',
              maxWidth: '90vw',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              minWidth: '260px',
              minHeight: '2.6em',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '45%',
                background: 'linear-gradient(90deg,rgba(255,255,255,0.45),rgba(255,255,255,0.05) 80%)',
                borderTopLeftRadius: '1.2rem',
                borderTopRightRadius: '1.2rem',
                pointerEvents: 'none',
                content: '""',
                zIndex: 1,
              }}
            />
            <span style={{ position: 'relative', zIndex: 2 }}>
              {
                (() => {
                  const centerOffset = Math.floor(visibleCountNum / 2);
                  let shownIndex;
                  let totalCount;
                  if (!isMobile) {
                    // PC時: 中央カードの番号を1セット分で表示
                    const setLength = emojiPairsArray.length / 3; // 1セット分の枚数
                    const centerIndex = currentIndex + centerOffset;
                    shownIndex = ((centerIndex % setLength) + setLength) % setLength + 1;
                    totalCount = setLength;
                  } else {
                    // モバイル時: currentIndexを1セット分で表示
                    const setLength = emojiPairsArray.length / 3;
                    shownIndex = ((currentIndex % setLength) + setLength) % setLength + 1;
                    totalCount = setLength;
                  }
                  return `現在表示中: ${shownIndex} / ${totalCount}`;
                })()
              }
            </span>
          </span>
          {/* Reloadボタン追加 */}
          <button
            style={{
              marginTop: '0.5em',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: '#f1f5f9',
              border: '1.5px solid #d1d5db',
              borderRadius: '0.8rem',
              padding: '0.3em 1.2em',
              cursor: 'pointer',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
              transition: 'background 0.2s',
              color: '#222', // 文字色を濃く
            }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfiniteCarousel; 