import { ProductCardSkeleton } from "@/components/product/card";
import { VideoCardSkeleton } from "@/components/video/card";
export default function Loading() {
  return (
    <div
      className="container loading-region"
      role="status"
      aria-label="핫템을 불러오는 중"
    >
      <div className="video-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
      <div className="product-grid section">
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only">불러오는 중입니다.</span>
    </div>
  );
}
