export function normalizeHttps(value: string) {
  const clean = value.trim().replace(/^(?:https?:\/\/)+/i, "");
  return clean ? `https://${clean}` : "";
}
export function isCatalogImage(
  value: string,
  storage = process.env.NEXT_PUBLIC_SUPABASE_URL,
) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      (["images.unsplash.com", "img.youtube.com"].includes(u.hostname) ||
        /^(?:image\d*|thumbnail\d*)\.coupangcdn\.com$/.test(u.hostname) ||
        u.hostname.endsWith(".cdninstagram.com") ||
        u.hostname.endsWith(".fbcdn.net") ||
        (!!storage &&
          u.origin === new URL(storage).origin &&
          u.pathname.startsWith("/storage/v1/object/public/site-images/")))
    );
  } catch {
    return false;
  }
}
export function allowedMetadataPage(value: string, kind: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      (kind === "product"
        ? [
            "link.coupang.com",
            "www.coupang.com",
            "coupang.com",
            "m.coupang.com",
          ].includes(u.hostname)
        : ["www.instagram.com", "instagram.com"].includes(u.hostname))
    );
  } catch {
    return false;
  }
}
export function extractImage(html: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g))
      attrs[m[1].toLowerCase()] = m[3];
    if (["og:image", "twitter:image"].includes(attrs.property || attrs.name)) {
      const url = (attrs.content || "").replace(/&amp;/g, "&");
      if (isCatalogImage(url)) return url;
    }
  }
  return "";
}
