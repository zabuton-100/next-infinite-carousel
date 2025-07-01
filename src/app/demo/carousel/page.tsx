import InfiniteCarousel from "../../../components/InfiniteCarousel";

export default function CarouselDemo() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-2 text-center flex items-center justify-center h-32 w-full">Carousel Demo</h1>
      <InfiniteCarousel />
    </div>
  );
}

export const metadata = {
  title: 'Carousel Demo',
}; 