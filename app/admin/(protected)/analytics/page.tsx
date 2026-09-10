import Link from "next/link";
import { getAnalytics } from "@/lib/analytics";
import { DailyChart, Ranking, Stats } from "@/components/admin/analytics";
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: input } = await searchParams;
  const range = ["today", "7", "30", "all"].includes(input || "")
    ? input!
    : "7";
  const stats = await getAnalytics(range);
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">ANALYTICS</span>
          <h1>어떤 핫템이 궁금했을까요?</h1>
          <p>쿠팡으로 이동한 클릭을 모았어요. 한국 시간 기준입니다.</p>
        </div>
      </div>
      <nav className="pill-row" aria-label="통계 기간">
        {[
          ["today", "오늘"],
          ["7", "7일"],
          ["30", "30일"],
          ["all", "전체"],
        ].map(([value, label]) => (
          <Link
            href={`/admin/analytics?range=${value}`}
            key={value}
            className={range === value ? "active" : ""}
            aria-current={range === value ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Stats
        items={[
          { label: "선택 기간 전체 클릭", value: stats.total },
          { label: "클릭된 상품", value: stats.products.length },
          { label: "클릭으로 이어진 영상", value: stats.videos.length },
          { label: "오늘 클릭", value: stats.today },
        ]}
      />
      <DailyChart daily={stats.daily} />
      <div className="admin-two-col">
        <Ranking title="TOP 10 상품" rows={stats.products} kind="products" />
        <Ranking title="TOP 10 영상" rows={stats.videos} kind="videos" />
      </div>
      <Ranking
        title="카테고리별 클릭"
        rows={stats.categories}
        limit={stats.categories.length}
      />
      <div className="admin-two-col">
        <Ranking
          title="전체 상품별 클릭"
          rows={stats.products}
          kind="products"
          limit={stats.products.length}
        />
        <Ranking
          title="전체 영상별 클릭"
          rows={stats.videos}
          kind="videos"
          limit={stats.videos.length}
        />
      </div>
      <p className="form-hint">
        방문자 수나 구매 건수와는 다릅니다. 일부 봇·미리보기 요청은 제외하며,
        중복 클릭은 각각 기록됩니다. 상품 상세에서 바로 클릭한 경우 영상
        통계에는 포함되지 않습니다.
      </p>
    </>
  );
}
