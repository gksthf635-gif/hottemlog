import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { publicSupabase, serverSupabase } from "@/lib/supabase/server";
import seed from "./seed.json";
import type {
  Catalog,
  Product,
  Video,
  Category,
  Settings,
  VideoProduct,
} from "@/types";
import { matchesSearch } from "@/lib/utils";
async function readAll<T>(
  client: ReturnType<typeof publicSupabase>,
  table: string,
  order = "id",
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .order(order)
      .range(offset, offset + 499);
    if (error)
      throw new Error(`데이터를 불러오지 못했습니다: ${table}`, {
        cause: error,
      });
    rows.push(...(data as T[]));
    if (data.length < 500) return rows;
  }
}
export const getCatalog = cache(async (admin = false): Promise<Catalog> => {
  if (!isSupabaseConfigured) {
    if (process.env.DEMO_MODE === "true" && !admin) return seed as Catalog;
    throw new Error(
      "Supabase 연결 설정이 필요합니다. README의 환경변수 설정을 확인하세요.",
    );
  }
  const client = admin ? await serverSupabase() : publicSupabase();
  const [products, videos, categories, links, settingRows] = await Promise.all([
    readAll<Product>(client, "products"),
    readAll<Video>(client, "videos"),
    readAll<Category>(client, "categories", "sort_order"),
    readAll<VideoProduct>(client, "video_products", "sort_order"),
    readAll<Settings>(client, "settings"),
  ]);
  if (!settingRows[0])
    throw new Error(
      "사이트 기본 설정이 없습니다. migration과 seed를 적용하세요.",
    );
  return {
    products: products.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    videos: videos.sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        b.published_at.localeCompare(a.published_at),
    ),
    categories,
    links,
    settings: settingRows[0],
    demo: false,
  };
});
export const getProducts = async () => (await getCatalog()).products;
export const getVideos = async () => (await getCatalog()).videos;
export const getProductBySlug = async (slug: string) =>
  (await getProducts()).find((p) => p.slug === slug);
export const getVideoBySlug = async (slug: string) =>
  (await getVideos()).find((v) => v.slug === slug);
export const getFeaturedProducts = async () =>
  (await getProducts()).filter((p) => p.featured);
export async function getProductsByVideo(id: string) {
  const c = await getCatalog();
  return c.links
    .filter((l) => l.video_id === id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((l) => c.products.filter((p) => p.id === l.product_id));
}
export async function getVideosByProduct(id: string) {
  const c = await getCatalog();
  return c.links
    .filter((l) => l.product_id === id)
    .flatMap((l) => c.videos.filter((v) => v.id === l.video_id));
}
export async function searchProducts(q: string, category = "") {
  const c = await getCatalog();
  return c.products.filter(
    (p) =>
      (!category ||
        c.categories.find((cat) => cat.id === p.category_id)?.slug ===
          category) &&
      matchesSearch(
        q,
        p.name,
        p.description,
        p.short_description,
        p.tags,
        c.categories.find((cat) => cat.id === p.category_id)?.name,
      ),
  );
}
export async function searchVideos(q: string) {
  const c = await getCatalog();
  return c.videos.filter((v) =>
    matchesSearch(
      q,
      v.title,
      v.description,
      v.tags,
      ...c.links
        .filter((l) => l.video_id === v.id)
        .flatMap((l) =>
          c.products
            .filter((p) => p.id === l.product_id)
            .flatMap((p) => [
              p.name,
              ...p.tags,
              c.categories.find((cat) => cat.id === p.category_id)?.name || "",
            ]),
        ),
    ),
  );
}
export const getPopularity = cache(
  async (): Promise<{
    products: { id: string; count: number }[];
    videos: { id: string; count: number }[];
  }> => {
    if (!isSupabaseConfigured) return { products: [], videos: [] };
    const { data, error } = await publicSupabase().rpc("public_popularity");
    if (error)
      throw new Error("인기 콘텐츠를 불러오지 못했습니다.", { cause: error });
    return data;
  },
);
export async function getPopularProducts() {
  const [c, stats] = await Promise.all([getCatalog(), getPopularity()]);
  const ordered = stats.products.flatMap((s) =>
    c.products.filter((p) => p.id === s.id),
  );
  return [
    ...ordered,
    ...c.products
      .filter((p) => !ordered.some((o) => o.id === p.id))
      .sort((a, b) => Number(b.featured) - Number(a.featured)),
  ];
}
export async function getPopularVideos() {
  const [c, stats] = await Promise.all([getCatalog(), getPopularity()]);
  const ordered = stats.videos.flatMap((s) =>
    c.videos.filter((v) => v.id === s.id),
  );
  return [
    ...ordered,
    ...c.videos.filter((v) => !ordered.some((o) => o.id === v.id)),
  ];
}
