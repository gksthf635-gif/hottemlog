import Link from "next/link";
import { ArrowDown, ArrowUpRight, Sparkles, Heart } from "lucide-react";
import { getCatalog, getPopularProducts } from "@/lib/data/catalog";
import { SearchForm } from "@/components/search/search-form";
import { VideoCard } from "@/components/video/card";
import { ProductCard } from "@/components/product/card";
import { CategoryFilter, SectionHeading } from "@/components/ui";
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
  const [c, popular] = await Promise.all([getCatalog(), getPopularProducts()]);
  const productsFor = (platform: string) =>
    c.products
      .filter((p) =>
        c.links.some(
          (l) =>
            l.product_id === p.id &&
            c.videos.some(
              (v) => v.id === l.video_id && v.platform === platform,
            ),
        ),
      )
      .slice(0, 4);
  const cards = (products: typeof c.products) =>
    products.map((p) => (
      <ProductCard
        key={p.id}
        product={p}
        category={c.categories.find((cat) => cat.id === p.category_id)}
      />
    ));
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
          title="방금 올라온 핫템"
          description="방금 본 그 영상, 궁금했던 제품을 만나보세요."
          href="/videos"
        />
        <div className="video-grid">
          {c.videos.slice(0, 4).map((v, i) => (
            <VideoCard
              key={v.id}
              video={v}
              count={c.links.filter((l) => l.video_id === v.id).length}
              priority={i < 2}
            />
          ))}
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="LOVED LATELY"
          title="요즘 많이 보는 핫템"
          description="영상 댓글에서 많이 물어본 제품들을 모았어요."
          href="/products?sort=popular"
        />
        <div className="product-grid">{cards(popular.slice(0, 4))}</div>
      </section>
      <section className="category-section">
        <div className="container">
          <SectionHeading
            eyebrow="FIND YOUR FAVORITE"
            title="어떤 핫템을 찾으세요?"
          />
          <CategoryFilter categories={c.categories} />
        </div>
      </section>
      {(["instagram", "youtube"] as const).map((platform) => (
        <section className="section container" key={platform}>
          <SectionHeading
            eyebrow={
              platform === "instagram" ? "FROM INSTAGRAM" : "FROM YOUTUBE"
            }
            title={`${platform === "instagram" ? "Instagram" : "YouTube"}에서 소개한 제품`}
            href={`/products?platform=${platform}`}
          />
          <div className="product-grid">{cards(productsFor(platform))}</div>
        </section>
      ))}
      <section className="section container">
        <SectionHeading
          eyebrow="THE COLLECTION"
          title="전체 추천템"
          description="일상에 쏙, 마음에 쏙. 하나씩 기록한 추천템."
          href="/products"
          action="추천템 더 보기"
        />
        <div className="product-grid">{cards(c.products.slice(0, 8))}</div>
      </section>
      <section className="about-section container">
        <Heart size={25} />
        <span className="eyebrow">A LITTLE NOTE FROM HANSOL</span>
        <h2>오늘의 핫템을 기록합니다.</h2>
        <p>
          한솔이 직접 써보고, 찾아보고, 소개한 핫템을 기록합니다.
          <br />
          소소한 발견이 당신의 일상에도 작은 도움이 되길 바라요.
        </p>
        <a
          href={c.settings.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          한솔의 일상 보러 가기 <ArrowUpRight size={16} />
        </a>
      </section>
    </>
  );
}
