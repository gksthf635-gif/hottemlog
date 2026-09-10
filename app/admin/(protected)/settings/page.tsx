import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { getCatalog } from "@/lib/data/catalog";
import { SettingsForm } from "@/components/admin/forms";
export default async function Settings() {
  await requireAdmin();
  const { settings } = await getCatalog(true);
  const trackingReady = Boolean(
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">SETTINGS</span>
          <h1>우리 사이트 설정</h1>
          <p>소개 문구, SNS 링크, 제휴 고지를 한곳에서 관리해요.</p>
        </div>
      </div>
      {!trackingReady && (
        <div className="setup-notice">
          클릭 통계 저장을 위한 서버 전용 키가 없습니다. Vercel 환경변수에
          SUPABASE_SECRET_KEY를 등록해 주세요.
        </div>
      )}
      <div className="form-panel">
        <h2>보조 관리</h2>
        <p>
          <Link href="/admin/categories">카테고리 관리</Link> ·{" "}
          <Link href="/admin/products">상품 개별 관리</Link> ·{" "}
          <Link href="/admin/videos">영상 개별 관리</Link>
        </p>
      </div>
      <SettingsForm settings={settings} />
    </>
  );
}
