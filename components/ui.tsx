import Link from "next/link";
import { ArrowUpRight, SearchX } from "lucide-react";
import type { Category } from "@/types";
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  action = "모두 보기",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {href && (
        <Link href={href} className="text-link">
          {action}
          <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function CategoryFilter({
  categories,
  active = "",
  base = "/products",
  query = "",
  extraParams = {},
}: {
  categories: Category[];
  active?: string;
  base?: string;
  query?: string;
  extraParams?: Record<string, string>;
}) {
  return (
    <nav className="category-filter" aria-label="카테고리 필터">
      {[{ id: "all", name: "전체", slug: "" }, ...categories].map((c) => {
        const params = new URLSearchParams(extraParams);
        if (c.slug) params.set("category", c.slug);
        if (query) params.set("q", query);
        return (
          <Link
            key={c.id}
            href={`${base}${params.size ? `?${params}` : ""}`}
            className={active === c.slug ? "active" : ""}
            aria-current={active === c.slug ? "page" : undefined}
          >
            {c.name}
          </Link>
        );
      })}
    </nav>
  );
}
export function EmptyState({
  title = "찾으시는 핫템이 아직 없어요.",
  description = "다른 검색어로 다시 찾아보세요.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <SearchX size={34} />
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href="/products" className="button secondary">
        전체 추천템 보기
      </Link>
    </div>
  );
}
