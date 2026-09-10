import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { getCatalog } from "@/lib/data/catalog";
import { getAnalytics } from "@/lib/analytics";
import { Stats, DailyChart, Ranking } from "@/components/admin/analytics";
import { dateLabel } from "@/lib/utils";
export default async function Dashboard() {
  await requireAdmin();
  const [c, all, week] = await Promise.all([
    getCatalog(true),
    getAnalytics("all"),
    getAnalytics("7"),
  ]);
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">YOUR CREATOR STUDIO</span>
          <h1>반가워요, 한솔님.</h1>
          <p>오늘도 일상에 도움이 되는 핫템을 기록해요.</p>
        </div>
        <Link href="/admin/products/new" className="button">
          <Plus size={18} />
          상품 등록
        </Link>
      </div>
      <Stats
        items={[
          { label: "등록한 영상", value: c.videos.length },
          { label: "등록한 상품", value: c.products.length },
          { label: "전체 클릭", value: all.total },
          { label: "오늘 클릭", value: all.today },
        ]}
      />
      <Stats
        items={[
          {
            label: "최근 7일 클릭",
            value: week.total,
            note: "오늘을 포함한 최근 7일",
          },
        ]}
      />
      <DailyChart daily={week.daily} />
      <div className="admin-two-col">
        <Ranking
          title="인기 상품 TOP 5"
          rows={all.products}
          kind="products"
          limit={5}
        />
        <Ranking
          title="인기 영상 TOP 5"
          rows={all.videos}
          kind="videos"
          limit={5}
        />
      </div>
      <section className="ranking-panel">
        <div className="section-heading">
          <h2>최근 등록 영상</h2>
          <Link href="/admin/videos" className="text-link">
            영상 관리 <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>영상 제목</th>
                <th>공개 상태</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {[...c.videos]
                .sort((a, b) => b.created_at.localeCompare(a.created_at))
                .slice(0, 5)
                .map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link href={`/admin/videos/${v.id}`}>{v.title}</Link>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${v.published ? "published" : ""}`}
                      >
                        {v.published ? "공개" : "비공개"}
                      </span>
                    </td>
                    <td>{dateLabel(v.created_at)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!c.videos.length && (
            <p className="admin-empty">첫 영상을 등록해 보세요.</p>
          )}
        </div>
      </section>
    </>
  );
}
