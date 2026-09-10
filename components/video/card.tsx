import Link from "next/link";
import { Play, Instagram, Youtube, ArrowUpRight } from "lucide-react";
import type { Video } from "@/types";
import { Media } from "@/components/media";
import { dateLabel, platformLabel } from "@/lib/utils";
export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className={`platform-badge ${platform}`}>
      {platform === "instagram" ? (
        <Instagram size={13} />
      ) : (
        <Youtube size={14} />
      )}{" "}
      {platformLabel(platform)}
    </span>
  );
}
export function VideoCard({
  video,
  count = 0,
  priority = false,
}: {
  video: Video;
  count?: number;
  priority?: boolean;
}) {
  return (
    <Link href={`/video/${video.slug}`} className="video-card">
      <div className="video-image">
        <Media
          src={video.thumbnail_url}
          alt={video.title}
          priority={priority}
        />
        <PlatformBadge platform={video.platform} />
        <span className="play-circle">
          <Play size={21} fill="currentColor" />
        </span>
        <div className="video-overlay">
          <span>영상 속 추천템 {count}개</span>
          <h3>{video.title}</h3>
          <span className="video-detail">
            자세히 보기 <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
      <div className="video-meta">
        <span>{dateLabel(video.published_at)}</span>
        <span>한솔의 핫템로그</span>
      </div>
    </Link>
  );
}
export function VideoCardSkeleton() {
  return (
    <div className="video-card skeleton" aria-hidden="true">
      <div className="video-image" />
      <div className="skeleton-line" />
    </div>
  );
}
