import { getCatalog } from "@/lib/data/catalog";
export const metadata = {
  title: "개인정보처리방침",
  alternates: { canonical: "/privacy" },
};
export default async function Privacy() {
  const { settings } = await getCatalog();
  return (
    <article className="container page-wrap legal">
      <span className="eyebrow">PRIVACY</span>
      <h1>개인정보처리방침</h1>
      <p>
        {settings.site_name}는 추천 콘텐츠 제공과 서비스 운영에 필요한 최소한의
        정보를 처리합니다.
      </p>
      <h2>1. 방문자 클릭 정보</h2>
      <p>
        쿠팡 링크를 누르면 상품 식별자, 연결된 영상 식별자(해당하는 경우), 클릭
        시간, 유입 사이트의 출처(origin), 브라우저 User-Agent를 저장합니다. 유입
        주소의 상세 경로와 검색어는 저장하지 않습니다. 애플리케이션 클릭
        테이블에는 IP 주소를 저장하지 않습니다.
      </p>
      <h2>2. 이용 목적과 보관</h2>
      <p>
        클릭 정보는 상품·영상·카테고리별 이용 통계에 사용합니다. 방문자별
        프로필이나 구매 이력을 만들지 않습니다. 운영자는 보관 중인 기록을
        정기적으로 검토하고 통계 목적에 더 이상 필요하지 않은 기록을 삭제합니다.
        보관 정책 관련 문의는 아래 연락처로 접수할 수 있습니다.
      </p>
      <h2>3. 관리자 계정과 쿠키</h2>
      <p>
        일반 방문자 회원가입은 제공하지 않습니다. 관리자 이메일과 인증 정보는
        Supabase Auth로 관리하며, 관리자 로그인 상태 유지에 필요한 인증 쿠키를
        사용합니다.
      </p>
      <h2>4. 외부 서비스</h2>
      <p>
        웹사이트 제공에는 Vercel을, 데이터·인증·이미지 저장에는 Supabase를
        사용합니다. 해당 서비스의 운영 로그 처리는 각 제공자의 정책을 따릅니다.
        외부 영상 및 쿠팡 링크를 열면 해당 서비스의 개인정보처리방침이
        적용됩니다. 상품 이미지가 외부 서버에서 제공되는 경우 해당 서버로 이미지
        요청이 전송될 수 있습니다.
      </p>
      <h2>5. 문의와 권리 행사</h2>
      <p>
        개인정보 관련 문의나 열람·삭제 요청은{" "}
        {settings.contact_email ? (
          <a href={`mailto:${settings.contact_email}`}>
            {settings.contact_email}
          </a>
        ) : (
          <a href={settings.instagram_url}>운영자의 Instagram</a>
        )}
        으로 보내 주세요. 요청을 확인한 뒤 처리 범위와 결과를 안내합니다.
      </p>
      <p>시행일: 2026년 9월 10일</p>
    </article>
  );
}
