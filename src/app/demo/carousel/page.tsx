import CarouselServer from "../../../components/CarouselServer";
import Clock from "./Clock";

export const metadata = {
  title: "Emoji",
};

export default function CarouselDemo() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-0 text-center flex items-center justify-center h-12 w-full">Emoji Carousel</h1>
      <Clock />
      <CarouselServer />
    </div>
  );
} 