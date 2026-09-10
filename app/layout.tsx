import type { Metadata } from "next";
import "./globals.css";
import { siteUrl, isSupabaseConfigured } from "@/lib/config";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots:
    !isSupabaseConfigured && process.env.DEMO_MODE === "true"
      ? { index: false, follow: false }
      : undefined,
  title: {
    default: "핫템로그 | 영상에서 본 추천템 모음",
    template: "%s | 핫템로그",
  },
  description:
    "인스타 릴스와 유튜브 쇼츠에서 소개한 추천 제품을 한곳에서 확인하세요.",
  openGraph: { siteName: "핫템로그", locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
