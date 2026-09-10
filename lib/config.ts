export const publicSupabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const isSupabaseConfigured = Boolean(supabaseUrl && publicSupabaseKey);
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
