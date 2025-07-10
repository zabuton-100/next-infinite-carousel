import InfiniteCarousel from "./InfiniteCarousel";

export default function CarouselServer() {
  // emojiPairsArrayの初期生成をやめ、空配列を渡す
  return <InfiniteCarousel emojiPairsArray={[]} />;
} 