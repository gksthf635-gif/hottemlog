export function youtubeId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    const id =
      host === "youtu.be"
        ? url.pathname.split("/")[1]
        : ["youtube.com", "m.youtube.com"].includes(host)
          ? url.pathname === "/watch"
            ? url.searchParams.get("v")
            : /^\/(shorts|embed)\//.test(url.pathname)
              ? url.pathname.split("/")[2]
              : null
          : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
export function youtubeThumbnail(url: string) {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : "";
}
export function isAffiliateUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (u.hostname === "coupang.com" || u.hostname.endsWith(".coupang.com"))
    );
  } catch {
    return false;
  }
}
export function isSocialUrl(value: string, platform: string) {
  try {
    const u = new URL(value);
    const host = u.hostname.replace(/^www\./, "");
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (platform === "instagram"
        ? host === "instagram.com"
        : platform === "youtube"
          ? ["youtube.com", "m.youtube.com", "youtu.be"].includes(host)
          : false)
    );
  } catch {
    return false;
  }
}
export function safeReferrer(value: string | null) {
  try {
    const u = new URL(value || "");
    return ["https:", "http:"].includes(u.protocol) ? u.origin : null;
  } catch {
    return null;
  }
}
export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .slice(0, 100);
}
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
export const platformLabel = (platform: string) =>
  platform === "instagram"
    ? "Instagram Reel"
    : platform === "youtube"
      ? "YouTube Shorts"
      : platform;
export function kstDay(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}
export function rangeStart(range: string, now = new Date()) {
  if (range === "all") return null;
  const days = range === "today" ? 0 : range === "30" ? 29 : 6;
  const start = new Date(`${kstDay(now)}T00:00:00+09:00`);
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString();
}
export function matchesSearch(
  query: string,
  ...parts: (string | string[] | undefined)[]
) {
  const haystack = parts
    .flat()
    .filter(Boolean)
    .join(" ")
    .normalize("NFKC")
    .toLocaleLowerCase("ko");
  return query
    .normalize("NFKC")
    .toLocaleLowerCase("ko")
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}
