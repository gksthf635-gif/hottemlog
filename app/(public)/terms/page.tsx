import { getCatalog } from "@/lib/data/catalog";
export const metadata = {
  title: "이용약관",
  alternates: { canonical: "/terms" },
};
export default async function Terms() {
  const { settings } = await getCatalog();
  return (
    <article className="container page-wrap legal">
      <span className="eyebrow">TERMS OF USE</span>
      <h1>이용약관</h1>
      <h2>1. 서비스 소개</h2>
      <p>
        {settings.site_name}는 SNS 영상에 소개된 상품 정보를 모아 제공하는
        콘텐츠 큐레이션 서비스입니다. 방문자는 별도 회원가입 없이 공개된
        콘텐츠를 이용할 수 있습니다.
      </p>
      <h2>2. 상품 정보와 구매</h2>
      <p>
        상품 구매·결제·배송·교환·환불은 링크로 연결된 판매 서비스에서
        이루어집니다. 상품의 가격, 사양, 재고와 판매 조건은 바뀔 수 있으므로
        구매 전 판매 페이지의 최신 정보를 확인해 주세요. 한줄평은 콘텐츠
        제작자의 큐레이션 의견입니다.
      </p>
      <h2>3. 제휴 링크</h2>
      <p>{settings.affiliate_disclosure}</p>
      <h2>4. 콘텐츠 이용</h2>
      <p>
        콘텐츠의 저작권은 각 권리자에게 있습니다. 권리자의 허락 없는 무단
        복제·재배포 및 서비스 운영을 방해하는 행위는 허용하지 않습니다.
      </p>
      <h2>5. 서비스 변경과 문의</h2>
      <p>
        운영 상황에 따라 공개 콘텐츠가 수정·삭제되거나 서비스가 일시 중단될 수
        있습니다. 잘못된 정보 또는 권리 관련 문의는 문의 페이지를 통해 알려
        주세요.
      </p>
      <p>시행일: 2026년 9월 10일</p>
    </article>
  );
}
