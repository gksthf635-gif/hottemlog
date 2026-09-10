import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/data/catalog";
import { siteUrl } from "@/lib/config";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getCatalog();
  return [
    ...["", "/products", "/videos", "/privacy", "/terms", "/contact"].map(
      (path) => ({
        url: `${siteUrl}${path}`,
        changeFrequency: "weekly" as const,
        priority: path ? 0.6 : 1,
      }),
    ),
    ...c.products.map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      lastModified: p.updated_at,
      priority: 0.8,
    })),
    ...c.videos.map((v) => ({
      url: `${siteUrl}/video/${v.slug}`,
      lastModified: v.updated_at,
      priority: 0.8,
    })),
  ];
}
