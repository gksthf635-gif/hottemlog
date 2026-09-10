import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import type { Category, Product } from "@/types";
import { Media } from "@/components/media";
export function AffiliateLink({
  product,
  videoId,
  className = "",
}: {
  product: Product;
  videoId?: string;
  className?: string;
}) {
  return (
    <a
      href={`/go/${product.id}${videoId ? `?video=${videoId}` : ""}`}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`affiliate-button ${className}`}
    >
      쿠팡에서 보기 <ArrowUpRight size={17} />
    </a>
  );
}
export function ProductCard({
  product,
  category,
  videoId,
}: {
  product: Product;
  category?: Category;
  videoId?: string;
}) {
  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-image">
        <Media src={product.image_url} alt={product.name} />
        {product.featured && (
          <span className="pick-label">
            <Heart size={12} /> HANSOL’S PICK
          </span>
        )}
      </Link>
      <div className="product-body">
        <span className="category-label">{category?.name || "기타"}</span>
        <Link href={`/product/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <p className="one-line">“{product.short_description}”</p>
        <AffiliateLink product={product} videoId={videoId} />
      </div>
    </article>
  );
}
export function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton" aria-hidden="true">
      <div className="product-image" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}
