import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { getCatalog } from "@/lib/data/catalog";
import { Media } from "@/components/media";
import { ItemActions } from "@/components/admin/forms";
import { dateLabel, platformLabel } from "@/lib/utils";
export default async function Contents({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; saved?: string }>;
}) {
  await requireAdmin();
  const c = await getCatalog(true);
  const { q = "", saved } = await searchParams;
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">CONTENTS</span>
          <h1>콘텐츠 관리</h1>
          <p>영상과 연결 상품을 한곳에서 관리하세요.</p>
        </div>
        <Link className="button" href="/admin/contents/new">
          + 새 콘텐츠 등록
        </Link>
      </div>
      {saved === "1" && (
        <div className="toast success" role="status">
          콘텐츠를 저장했습니다.
        </div>
      )}
      <form className="admin-search">
        <input
          name="q"
          defaultValue={q}
          aria-label="콘텐츠 검색"
          placeholder="영상 제목 검색"
        />
        <button className="button secondary">검색</button>
      </form>
      <div className="content-rows">
        {c.videos
          .filter((v) => v.title.toLowerCase().includes(q.toLowerCase()))
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((v) => (
            <article className="content-row" key={v.id}>
              <div className="admin-thumb">
                <Media src={v.thumbnail_url} alt={v.title} sizes="80px" />
              </div>
              <div className="content-row-info">
                <small>
                  {platformLabel(v.platform)} · 상품{" "}
                  {c.links.filter((l) => l.video_id === v.id).length}개 ·{" "}
                  {dateLabel(v.published_at)}
                </small>
                <Link href={`/admin/contents/${v.id}/edit`}>
                  <h2>{v.title}</h2>
                </Link>
                <span
                  className={`status-badge ${v.published ? "published" : ""}`}
                >
                  {v.published ? "공개" : "비공개"}
                </span>
                {v.featured && (
                  <span className="status-badge featured">Featured</span>
                )}{" "}
              </div>
              <ItemActions
                kind="videos"
                id={v.id}
                name={v.title}
                published={v.published}
                featured={v.featured}
              />
            </article>
          ))}
      </div>
      {!c.videos.some((v) =>
        v.title.toLowerCase().includes(q.toLowerCase()),
      ) && <p className="admin-empty">콘텐츠가 없습니다.</p>}
      <p className="form-hint">
        콘텐츠 삭제 시 영상과 연결만 삭제됩니다. 상품과 기존 클릭 기록은
        보존됩니다.
      </p>
    </>
  );
}
