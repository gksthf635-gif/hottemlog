import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getCatalog } from "@/lib/data/catalog";
import { requireAdmin } from "@/lib/auth/admin";
import { ItemActions } from "@/components/admin/forms";
import { Media } from "@/components/media";
import { platformLabel } from "@/lib/utils";
export async function ContentList({
  kind,
  q = "",
}: {
  kind: "products" | "videos";
  q?: string;
}) {
  await requireAdmin();
  const c = await getCatalog(true);
  const products = kind === "products";
  const rows = products
    ? c.products.map((p) => ({
        id: p.id,
        label: p.name,
        image: p.image_url,
        slug: p.slug,
        published: p.published,
        featured: p.featured,
        subtitle:
          c.categories.find((cat) => cat.id === p.category_id)?.name ||
          "미분류",
      }))
    : c.videos.map((v) => ({
        id: v.id,
        label: v.title,
        image: v.thumbnail_url,
        slug: v.slug,
        published: v.published,
        featured: v.featured,
        subtitle: `${platformLabel(v.platform)} · 순서 ${v.sort_order}`,
      }));
  const filtered = rows.filter((r) =>
    r.label.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">{products ? "PRODUCTS" : "VIDEOS"}</span>
          <h1>{products ? "상품 관리" : "영상 관리"}</h1>
          <p>
            {rows.length}개의 {products ? "상품" : "영상"}을 기록했어요.
          </p>
        </div>
        <Link href={`/admin/${kind}/new`} className="button">
          <Plus size={18} />
          {products ? "상품" : "영상"} 등록
        </Link>
      </div>
      <form className="admin-search" action={`/admin/${kind}`}>
        <Search size={19} />
        <input
          name="q"
          defaultValue={q}
          placeholder={`${products ? "상품명" : "영상 제목"}으로 검색`}
          aria-label="관리 콘텐츠 검색"
        />
        <button className="button secondary small">검색</button>
      </form>
      <div className="content-rows">
        {filtered.map((r) => (
          <article key={r.id} className="content-row">
            <div className="admin-thumb">
              <Media src={r.image} alt={r.label} sizes="80px" />
            </div>
            <div className="content-row-info">
              <small>{r.subtitle}</small>
              <Link href={`/admin/${kind}/${r.id}`}>
                <h2>{r.label}</h2>
              </Link>
              <span
                className={`status-badge ${r.published ? "published" : ""}`}
              >
                {r.published ? "공개" : "비공개"}
              </span>
              {r.featured && (
                <span className="status-badge featured">추천</span>
              )}{" "}
              {r.published && (
                <Link
                  className="preview-link"
                  href={`/${products ? "product" : "video"}/${r.slug}`}
                  target="_blank"
                >
                  사이트에서 보기 ↗
                </Link>
              )}
            </div>
            <ItemActions
              kind={kind}
              id={r.id}
              name={r.label}
              published={r.published}
              featured={r.featured}
            />
          </article>
        ))}
        {!filtered.length && (
          <div className="admin-empty">
            {q
              ? "검색 결과가 없습니다."
              : "아직 기록이 없어요. 첫 콘텐츠를 등록해 보세요."}
          </div>
        )}
      </div>
    </>
  );
}
