"use client";
import { useRouter, useSearchParams } from "next/navigation";
export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <select
      aria-label="상품 정렬"
      value={value}
      onChange={(e) => {
        const next = new URLSearchParams(params);
        next.set("sort", e.target.value);
        next.delete("page");
        router.push(`/products?${next}`);
      }}
    >
      <option value="latest">최근 등록순</option>
      <option value="popular">많이 보는 순</option>
      <option value="featured">한솔의 추천순</option>
    </select>
  );
}
