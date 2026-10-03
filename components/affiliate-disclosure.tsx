export const AFFILIATE_DISCLOSURE =
  "이 포스팅은 쿠팡파트너스 활동의 일환으로 이에따른 일정액의 수수료를 제공받습니다.";

export function AffiliateDisclosure() {
  return (
    <aside
      className="post-affiliate-disclosure"
      aria-label="광고 및 쿠팡파트너스 안내"
    >
      <span className="advertisement-label">광고</span>
      <strong>{AFFILIATE_DISCLOSURE}</strong>
    </aside>
  );
}
