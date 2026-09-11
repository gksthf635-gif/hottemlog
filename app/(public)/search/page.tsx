import { getCatalog, searchProducts, searchVideos } from "@/lib/data/catalog";
import { SearchForm } from "@/components/search/search-form";
import { ProductQuickLinks } from "@/components/product/quick-links";
import { VideoCard } from "@/components/video/card";
import { CategoryFilter, EmptyState, SectionHeading } from "@/components/ui";
export const metadata = {
  title: "핫템 검색",
  robots: { index: false, follow: true },
};
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0, 100);
  const [c, products, videos] = await Promise.all([
    getCatalog(),
    searchProducts(q, params.category),
    searchVideos(q),
  ]);
  const filteredVideos = params.category
    ? videos.filter((v) =>
        c.links.some(
          (l) =>
            l.video_id === v.id && products.some((p) => p.id === l.product_id),
        ),
      )
    : videos;
  return (
    <div className="container page-wrap">
      <div className="page-heading">
        <span className="eyebrow">FIND YOUR HOT ITEM</span>
        <h1>{q ? `“${q}” 검색 결과` : "어떤 핫템이 궁금하세요?"}</h1>
        <SearchForm query={q} />
      </div>
      <CategoryFilter
        categories={c.categories}
        active={params.category}
        base="/search"
        query={q}
      />
      {!products.length && !filteredVideos.length ? (
        <EmptyState />
      ) : (
        <>
          {filteredVideos.length > 0 && (
            <section className="section">
              <SectionHeading title={`영상 ${filteredVideos.length}개`} />
              <div className="video-grid all-videos">
                {filteredVideos.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    count={c.links.filter((l) => l.video_id === v.id).length}
                  />
                ))}
              </div>
            </section>
          )}
          {products.length > 0 && (
            <section className="section">
              <SectionHeading title={`상품 ${products.length}개`} />
              <ProductQuickLinks
                products={products}
                categories={c.categories}
                videos={c.videos}
                links={c.links}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
