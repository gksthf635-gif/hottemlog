import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  getCatalog,
  getVideoBySlug,
  getProductsByVideo,
} from "@/lib/data/catalog";
import { Media } from "@/components/media";
import { PlatformBadge } from "@/components/video/card";
import { ProductCard } from "@/components/product/card";
import { EmptyState, SectionHeading } from "@/components/ui";
import { dateLabel } from "@/lib/utils";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = await getVideoBySlug(slug);
  if (!v) notFound();
  return {
    title: v.title,
    description: v.description,
    alternates: { canonical: `/video/${v.slug}` },
    openGraph: {
      title: v.title,
      description: v.description,
      url: `/video/${v.slug}`,
      images: v.thumbnail_url ? [v.thumbnail_url] : [],
    },
  };
}
export default async function VideoDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = await getVideoBySlug(slug);
  if (!v) notFound();
  const [c, products] = await Promise.all([
    getCatalog(),
    getProductsByVideo(v.id),
  ]);
  return (
    <div className="container page-wrap">
      <nav className="breadcrumb">
        <Link href="/">홈</Link>
        <span>/</span>
        <Link href="/videos">영상 속 핫템</Link>
      </nav>
      <div className="detail-grid video-detail-grid">
        <div className="detail-video-image">
          <Media
            src={v.thumbnail_url}
            alt={v.title}
            priority
            sizes="(max-width:640px) 90vw, 380px"
          />
        </div>
        <div className="detail-copy">
          <PlatformBadge platform={v.platform} />
          <h1>{v.title}</h1>
          <p className="video-meta">
            {dateLabel(v.published_at)} · 영상 속 추천템 {products.length}개
          </p>
          <div className="prose">
            <p>{v.description}</p>
          </div>
          <a
            href={v.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="button"
          >
            {v.platform === "instagram" ? "인스타그램" : "유튜브"}에서 영상 보기{" "}
            <ArrowUpRight size={18} />
          </a>
          <p className="disclosure">{c.settings.affiliate_disclosure}</p>
        </div>
      </div>
      <section className="section">
        <SectionHeading
          title="이 영상에 나온 제품"
          description="궁금했던 제품을 바로 확인해 보세요."
        />
        {products.length ? (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={c.categories.find((cat) => cat.id === p.category_id)}
                videoId={v.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="제품 정보를 준비하고 있어요."
            description="곧 이 영상의 추천템을 만나보실 수 있어요."
          />
        )}
      </section>
    </div>
  );
}
