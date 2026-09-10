import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  isSupabaseConfigured,
  publicSupabaseKey,
  supabaseUrl,
} from "@/lib/config";
export async function serverSupabase() {
  if (!isSupabaseConfigured)
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  const jar = await cookies();
  return createServerClient(supabaseUrl, publicSupabaseKey, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Server Components cannot write cookies; proxy refreshes the session. */
        }
      },
    },
  });
}
export function publicSupabase() {
  if (!isSupabaseConfigured)
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  return createClient(supabaseUrl, publicSupabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export function secretSupabase() {
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !supabaseUrl)
    throw new Error("서버 전용 Supabase 키가 필요합니다.");
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
