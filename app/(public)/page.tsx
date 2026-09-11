import Link from "next/link";
import { ArrowDown, Sparkles } from "lucide-react";
import { getCatalog } from "@/lib/data/catalog";
import { SearchForm } from "@/components/search/search-form";
import { VideoCard } from "@/components/video/card";
import { ProductQuickLinks } from "@/components/product/quick-links";
import { SectionHeading } from "@/components/ui";
export async function generateMetadata() {
  const { settings } = await getCatalog();
  return {
    title: { absolute: settings.default_seo_title },
    description: settings.default_seo_description,
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.default_seo_title,
      description: settings.default_seo_description,
      url: "/",
    },
  };
}
export default async function Home() {
  const c = await getCatalog();
  const latest = [...c.videos]
    .sort(
      (a, b) =>
        b.published_at.localeCompare(a.published_at) ||
        a.sort_order - b.sort_order,
    )
    .slice(0, 4);
  return (
    <>
      <section className="hero container">
        <div className="hero-topline">
          <span className="eyebrow">
            <Sparkles size={14} /> SMALL FINDS, BETTER DAYS
          </span>
          <span className="hero-note">좋아하는 것들의 기록</span>
        </div>
        <h1>
          영상에서 본 핫템,
          <br />
          <span>여기 다 있어요.</span>
          <Sparkles className="hero-spark" />
        </h1>
        <p>{c.settings.site_description}</p>
        <SearchForm />
        <div className="hero-bottom">
          <div className="suggestions">
            <span>많이 찾는</span>
            {["주방", "정리", "뷰티"].map((q) => (
              <Link href={`/search?q=${q}`} key={q}>
                #{q}
              </Link>
            ))}
          </div>
          <a href="#latest" className="text-link">
            최신 핫템 보기 <ArrowDown size={15} />
          </a>
        </div>
      </section>
      <section className="section container" id="latest">
        <SectionHeading
          eyebrow="THE LATEST LOG"
          title="최신 영상"
          description="방금 본 그 영상, 궁금했던 제품을 만나보세요."
          href="/videos"
        />
        {!latest.length && (
          <p className="quick-empty">아직 등록된 영상이 없어요.</p>
        )}
        <div className="video-grid">
          {latest.map((v, i) => (
            <VideoCard
              key={v.id}
              video={v}
              count={c.links.filter((l) => l.video_id === v.id).length}
              priority={i < 2}
            />
          ))}
        </div>
      </section>
      <section className="section container quick-section" id="hot-items">
        <SectionHeading
          eyebrow="FIND YOUR HOT ITEM"
          title="핫템 바로가기"
          description="영상속의 핫템을 찾아드립니다."
        />
        <ProductQuickLinks
          products={c.products}
          categories={c.categories}
          videos={c.videos}
          links={c.links}
          filter
        />
      </section>
    </>
  );
}
