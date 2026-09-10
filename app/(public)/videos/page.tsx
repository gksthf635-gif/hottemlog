import Link from "next/link";
import { getCatalog } from "@/lib/data/catalog";
import { VideoCard } from "@/components/video/card";
import { EmptyState } from "@/components/ui";
export const metadata = {
  title: "영상 속 핫템",
  description: "인스타그램 릴스와 유튜브 쇼츠에 나온 추천 제품을 찾아보세요.",
  alternates: { canonical: "/videos" },
};
export default async function Videos({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; featured?: string }>;
}) {
  const p = await searchParams;
  const c = await getCatalog();
  const videos = c.videos.filter(
    (v) =>
      (!p.platform || v.platform === p.platform) && (!p.featured || v.featured),
  );
  return (
    <div className="container page-wrap">
      <div className="page-heading">
        <span className="eyebrow">WATCH & DISCOVER</span>
        <h1>영상 속 핫템</h1>
        <p>그 영상에 나온 제품, 여기서 찾아보세요.</p>
      </div>
      <div className="pill-row">
        {[
          ["", "전체 영상"],
          ["instagram", "Instagram Reel"],
          ["youtube", "YouTube Shorts"],
        ].map(([platform, label]) => (
          <Link
            key={platform}
            href={`/videos${platform ? `?platform=${platform}` : ""}`}
            className={(p.platform || "") === platform ? "active" : ""}
          >
            {label}
          </Link>
        ))}
      </div>
      {videos.length ? (
        <div className="video-grid all-videos">
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              count={c.links.filter((l) => l.video_id === v.id).length}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="아직 등록된 영상이 없어요."
          description="새로운 핫템을 곧 소개할게요."
        />
      )}
    </div>
  );
}
