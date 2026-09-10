import Link from "next/link";
import { SearchX } from "lucide-react";
export default function NotFound() {
  return (
    <main id="main-content" className="error-panel">
      <SearchX size={40} />
      <span className="eyebrow">404 · NOT FOUND</span>
      <h1>이 핫템은 찾을 수 없어요.</h1>
      <p>주소가 변경되었거나 더 이상 공개되지 않는 핫템이에요.</p>
      <Link href="/" className="button">
        핫템로그 홈으로
      </Link>
    </main>
  );
}
