import { z } from "zod";
import { isAffiliateUrl, isSocialUrl, youtubeId } from "@/lib/utils";
const text = (max: number) =>
  z.string().trim().max(max, "입력 가능한 글자 수를 초과했습니다.");
const required = (max: number) =>
  text(max).min(1, "필수 항목을 입력해 주세요.");
const slug = required(100).regex(
  /^[a-z0-9가-힣]+(?:-[a-z0-9가-힣]+)*$/,
  "주소에는 한글, 영문 소문자, 숫자와 하이픈만 사용할 수 있어요.",
);
const id = z.uuid().optional();
const image = text(2048).refine((value) => {
  if (!value) return true;
  try {
    const u = new URL(value);
    const configured = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (["images.unsplash.com", "img.youtube.com"].includes(u.hostname) ||
        (!!configured &&
          u.origin === new URL(configured).origin &&
          u.pathname.startsWith("/storage/v1/object/public/site-images/")))
    );
  } catch {
    return false;
  }
}, "이미지를 업로드하거나 허용된 Supabase / YouTube 이미지 주소를 입력해 주세요.");
const common = {
  id,
  slug,
  published: z.boolean(),
  featured: z.boolean(),
  tags: z.array(text(40)).max(20),
};
export const productSchema = z.object({
  ...common,
  name: required(120),
  category_id: z.uuid().nullable(),
  image_url: image,
  short_description: required(180),
  description: required(10000),
  recommendation: text(2000),
  recommend_points: z.array(required(300)).max(20),
  affiliate_url: required(2048).refine(
    isAffiliateUrl,
    "https://로 시작하는 쿠팡 링크를 입력해 주세요.",
  ),
});
export const videoSchema = z
  .object({
    ...common,
    title: required(120),
    platform: z.enum(["instagram", "youtube"]),
    video_url: required(2048),
    thumbnail_url: image,
    description: text(10000),
    sort_order: z.number().int().min(0).max(99999),
    published_at: z.iso.datetime({ offset: true }),
  })
  .refine(
    (v) =>
      isSocialUrl(v.video_url, v.platform) &&
      (v.platform === "youtube"
        ? !!youtubeId(v.video_url)
        : /^\/reels?\/[^/]+/.test(new URL(v.video_url).pathname)),
    {
      message: "선택한 플랫폼의 올바른 https 영상 주소를 입력해 주세요.",
      path: ["video_url"],
    },
  );
export const categorySchema = z.object({
  id,
  name: required(40),
  slug,
  sort_order: z.number().int().min(0).max(9999),
});
export const settingsSchema = z.object({
  site_name: required(50),
  site_description: required(500),
  instagram_url: text(2048).refine(
    (v) => !v || isSocialUrl(v, "instagram"),
    "Instagram 주소를 확인해 주세요.",
  ),
  youtube_url: text(2048).refine(
    (v) => !v || isSocialUrl(v, "youtube"),
    "YouTube 주소를 확인해 주세요.",
  ),
  affiliate_disclosure: required(2000),
  footer_text: required(300),
  default_seo_title: required(120),
  default_seo_description: required(500),
  logo_url: image,
  contact_email: z.union([z.literal(""), z.email()]),
});
export const linksSchema = z
  .array(z.uuid())
  .max(100)
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "중복 연결은 허용하지 않습니다.",
  );
