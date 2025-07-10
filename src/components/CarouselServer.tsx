import InfiniteCarousel from "./InfiniteCarousel";
// @ts-expect-error: 型定義が無いためanyでimport
import emojiDictionary from "emoji-dictionary";

const pastelColors = [
  '#ffd1dc', '#ffe4b5', '#b5ead7', '#c7ceea', '#fdfd96', '#baffc9', '#bae1ff', '#fff1ba', '#ffb7b2', '#e2f0cb',
  '#ffe0f0', '#ffe5ec', '#e0bbff', '#d0f4de', '#f1f7b5', '#b5ead7', '#b5d8ff', '#f7cac9', '#f6eac2', '#e2f0cb',
  '#f3ffe3', '#e3f6fd', '#fff5e1', '#f9e2ae', '#e4f9f5', '#f7f6e7', '#fbe7c6', '#e2ece9', '#f6dfeb',
];
const darkColors = [
  '#22223b', '#4a4e69', '#232946', '#1a1a2e', '#2d3142', '#222831', '#393e46', '#212121', '#343a40', '#2c2c54',
  '#1b1b2f', '#162447', '#1f4068', '#283655', '#3a3a3a', '#232931', '#393e46', '#222f3e', '#2d3436', '#353b48',
  '#2f3640', '#1e272e', '#485460', '#3d3d5c', '#2c3e50', '#22313f', '#1a1a40', '#232b2b', '#2e2e38', '#22223b',
];

function getRandomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

export default function CarouselServer() {
  // emojiPairsArrayの初期生成をやめ、空配列を渡す
  return <InfiniteCarousel emojiPairsArray={[]} />;
} 