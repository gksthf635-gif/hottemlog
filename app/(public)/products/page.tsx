import Link from "next/link";
import { Suspense } from "react";
import { getCatalog, getPopularProducts } from "@/lib/data/catalog";
import { ProductCard } from "@/components/product/card";
import { CategoryFilter, EmptyState } from "@/components/ui";
import { SortSelect } from "@/components/search/sort-select";
export const metadata = {
  title: "전체 추천템",
  description: "생활부터 디지털까지, 한솔이 골라본 추천 제품을 만나보세요.",
  alternates: { canonical: "/products" },
};
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    platform?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const p = await searchParams;
  const c = await getCatalog();
  const sort = ["popular", "featured"].includes(p.sort || "")
    ? p.sort!
    : "latest";
  let products =
    sort === "popular" ? await getPopularProducts() : [...c.products];
  if (sort === "featured")
    products.sort((a, b) => Number(b.featured) - Number(a.featured));
  if (p.category)
    products = products.filter(
      (item) =>
        c.categories.find((cat) => cat.id === item.category_id)?.slug ===
        p.category,
    );
  if (p.platform)
    products = products.filter((item) =>
      c.links.some(
        (l) =>
          l.product_id === item.id &&
          c.videos.some(
            (v) => v.id === l.video_id && v.platform === p.platform,
          ),
      ),
    );
  const totalPages = Math.max(1, Math.ceil(products.length / 12));
  const page = Math.min(
    totalPages,
    Math.max(1, Math.floor(Number(p.page) || 1)),
  );
  return (
    <div className="container page-wrap">
      <div className="page-heading">
        <span className="eyebrow">THE COLLECTION</span>
        <h1>전체 추천템</h1>
        <p>요즘 잘 쓰는 제품만 모았어요.</p>
      </div>
      <CategoryFilter
        categories={c.categories}
        active={p.category}
        extraParams={{ sort, ...(p.platform ? { platform: p.platform } : {}) }}
      />
      <div className="pill-row">
        {[
          ["", "모든 플랫폼"],
          ["instagram", "Instagram"],
          ["youtube", "YouTube"],
        ].map(([platform, label]) => (
          <Link
            key={platform}
            href={`/products?${new URLSearchParams({ ...(p.category ? { category: p.category } : {}), sort, ...(platform ? { platform } : {}) })}`}
            className={(p.platform || "") === platform ? "active" : ""}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="listing-tools">
        <p>
          기록한 핫템 <strong>{products.length}</strong>개
        </p>
        <Suspense>
          <SortSelect value={sort} />
        </Suspense>
      </div>
      {products.length ? (
        <div className="product-grid">
          {products.slice((page - 1) * 12, page * 12).map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              category={c.categories.find((cat) => cat.id === item.category_id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      {totalPages > 1 && (
        <nav className="pill-row" aria-label="페이지">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              aria-current={page === i + 1 ? "page" : undefined}
              className={page === i + 1 ? "active" : ""}
              key={i}
              href={`/products?${new URLSearchParams({ ...p, page: String(i + 1) })}`}
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
