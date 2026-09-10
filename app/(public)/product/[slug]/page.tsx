import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCatalog,
  getProductBySlug,
  getVideosByProduct,
} from "@/lib/data/catalog";
import { Media } from "@/components/media";
import { AffiliateLink, ProductCard } from "@/components/product/card";
import { VideoCard } from "@/components/video/card";
import { SectionHeading } from "@/components/ui";
import { siteUrl } from "@/lib/config";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  return {
    title: p.name,
    description: p.short_description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      title: p.name,
      description: p.short_description,
      url: `/product/${p.slug}`,
      images: p.image_url ? [p.image_url] : [],
    },
  };
}
export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  const [c, videos] = await Promise.all([
    getCatalog(),
    getVideosByProduct(p.id),
  ]);
  const category = c.categories.find((cat) => cat.id === p.category_id);
  const related = c.products
    .filter((other) => other.id !== p.id && other.category_id === p.category_id)
    .slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.image_url,
    description: p.short_description,
    url: `${siteUrl}/product/${p.slug}`,
    category: category?.name,
  };
  return (
    <div className="container page-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="breadcrumb">
        <Link href="/">홈</Link>
        <span>/</span>
        <Link href="/products">추천템</Link>
        <span>/</span>
        <span>{category?.name || "기타"}</span>
      </nav>
      <div className="detail-grid">
        <div className="detail-image">
          <Media
            src={p.image_url}
            alt={p.name}
            priority
            sizes="(max-width:640px) 100vw, 50vw"
          />
        </div>
        <div className="detail-copy">
          {category && <span className="category-label">{category.name}</span>}
          <h1>{p.name}</h1>
          {p.short_description && (
            <p className="detail-quote">“{p.short_description}”</p>
          )}
          {(p.description || p.recommendation) && (
            <div className="prose">
              {p.description && <p>{p.description}</p>}
              {p.recommendation && (
                <>
                  <h2>한솔이 추천하는 이유</h2>
                  <p>{p.recommendation}</p>
                </>
              )}
            </div>
          )}
          {p.recommend_points.length > 0 && (
            <>
              <h2 className="subheading">이런 점이 좋아요</h2>
              <ul className="recommend-points">
                {p.recommend_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </>
          )}
          <AffiliateLink product={p} />
          <p className="disclosure">{c.settings.affiliate_disclosure}</p>
        </div>
      </div>
      {videos.length > 0 && (
        <section className="section">
          <SectionHeading title="이 제품이 나온 영상" />
          <div className="video-grid all-videos">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                count={c.links.filter((l) => l.video_id === v.id).length}
              />
            ))}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="section">
          <SectionHeading
            title="같은 카테고리 추천템"
            href={`/products?category=${category?.slug || ""}`}
          />
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} category={category} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
