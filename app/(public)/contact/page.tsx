import { getCatalog } from "@/lib/data/catalog";
import { ArrowUpRight } from "lucide-react";
export const metadata = {
  title: "문의",
  alternates: { canonical: "/contact" },
};
export default async function Contact() {
  const { settings } = await getCatalog();
  return (
    <article className="container page-wrap legal">
      <span className="eyebrow">SAY HELLO</span>
      <h1>핫템로그에 이야기해 주세요.</h1>
      <p>
        제품 정보 수정, 콘텐츠 관련 문의 또는 전하고 싶은 이야기가 있나요?
        <br />
        확인하고 답변드릴게요.
      </p>
      {settings.contact_email ? (
        <a href={`mailto:${settings.contact_email}`} className="button">
          {settings.contact_email} <ArrowUpRight size={17} />
        </a>
      ) : (
        <a
          href={settings.instagram_url || "https://www.instagram.com/"}
          target="_blank"
          rel="noopener noreferrer"
          className="button"
        >
          Instagram으로 문의하기 <ArrowUpRight size={17} />
        </a>
      )}
    </article>
  );
}
