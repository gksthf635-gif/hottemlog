import { Search, ArrowUpRight } from "lucide-react";
export function SearchForm({
  query = "",
  compact = false,
}: {
  query?: string;
  compact?: boolean;
}) {
  return (
    <form
      action="/search"
      className={`search-box ${compact ? "compact" : ""}`}
      role="search"
    >
      <Search size={22} />
      <label
        className="sr-only"
        htmlFor={compact ? "search-small" : "search-main"}
      >
        상품과 영상 검색
      </label>
      <input
        id={compact ? "search-small" : "search-main"}
        name="q"
        defaultValue={query}
        placeholder="어떤 제품을 찾고 계세요?"
        maxLength={100}
        required
      />
      <button aria-label="검색하기" type="submit">
        <ArrowUpRight size={22} />
      </button>
    </form>
  );
}
