"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="error-panel">
      <h1>잠시 연결이 어려워요.</h1>
      <p>
        데이터를 불러오는 중 문제가 생겼어요. 아래 버튼으로 다시 시도해 주세요.
      </p>
      <button className="button" onClick={reset}>
        다시 시도
      </button>
      <Link href="/" className="text-link">
        핫템로그 홈으로
      </Link>
    </main>
  );
}
