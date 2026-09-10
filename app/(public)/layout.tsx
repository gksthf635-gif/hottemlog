import { getCatalog } from "@/lib/data/catalog";
import { Header, Footer } from "@/components/layout/site";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { settings } = await getCatalog();
  return {
    title: {
      default: settings.default_seo_title,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.default_seo_description,
    openGraph: {
      siteName: settings.site_name,
      locale: "ko_KR",
      type: "website" as const,
    },
  };
}
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, demo } = await getCatalog();
  return (
    <>
      <Header settings={settings} />
      <main id="main-content">
        {demo && (
          <div className="demo-notice">
            샘플 미리보기 · 사진은 연출용이며 링크는 실제 추천 상품이 아닙니다.
          </div>
        )}
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
