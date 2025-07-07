import { useEffect, useState } from "react";

export function useResponsiveCarouselCount() {
  const [visibleCount, setVisibleCount] = useState<number | undefined>(undefined);
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setVisibleCount(3);
        setIsMobile(true);
      } else {
        setVisibleCount(3);
        setIsMobile(false);
      }
    }
  }, []);

  return { visibleCount, isMobile };
} 