import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/forms";
import { isSupabaseConfigured } from "@/lib/config";
export const metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <main className="login-page" id="main-content">
      <div className="login-card">
        <div className="login-brand">
          <Sparkles />
          <span>HOT ITEM LOG</span>
        </div>
        <h1>한솔의 작은 편집실</h1>
        <p>오늘 발견한 핫템을 기록해 볼까요?</p>
        {!isSupabaseConfigured && (
          <div className="setup-notice">
            <strong>Supabase 연결을 준비해 주세요.</strong>
            <p>
              .env.local 입력 → migration 적용 → 관리자 계정 생성 순서로
              설정하세요. 자세한 방법은 README.md에 있습니다.
            </p>
          </div>
        )}
        {reason === "forbidden" && (
          <p role="alert">관리자 권한이 없는 계정입니다.</p>
        )}
        <LoginForm configured={isSupabaseConfigured} />
        <Link href="/" className="text-link">
          <ArrowLeft size={15} />
          핫템로그로 돌아가기
        </Link>
        <small>등록된 관리자만 로그인할 수 있습니다.</small>
      </div>
    </main>
  );
}
