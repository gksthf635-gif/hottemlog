export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
};
export type Product = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  short_description: string;
  description: string;
  recommendation: string;
  recommend_points: string[];
  affiliate_url: string;
  category_id: string | null;
  published: boolean;
  featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};
export type Video = {
  id: string;
  title: string;
  slug: string;
  platform: string;
  video_url: string;
  thumbnail_url: string;
  description: string;
  published: boolean;
  featured: boolean;
  sort_order: number;
  tags: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
};
export type VideoProduct = {
  id: string;
  video_id: string;
  product_id: string;
  sort_order: number;
};
export type Settings = {
  id: number;
  site_name: string;
  site_description: string;
  instagram_url: string;
  youtube_url: string;
  affiliate_disclosure: string;
  footer_text: string;
  default_seo_title: string;
  default_seo_description: string;
  logo_url: string;
  contact_email: string;
};
export type Catalog = {
  products: Product[];
  videos: Video[];
  categories: Category[];
  links: VideoProduct[];
  settings: Settings;
  demo: boolean;
};
export type FormState = { ok: boolean; message: string; id?: string };
export type Analytics = {
  total: number;
  today: number;
  daily: { date: string; count: number }[];
  products: { id: string; name: string; count: number }[];
  videos: { id: string; name: string; count: number }[];
  categories: { id: string; name: string; count: number }[];
};
