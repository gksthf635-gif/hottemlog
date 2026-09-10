import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isSupabaseConfigured,
  publicSupabaseKey,
  supabaseUrl,
} from "@/lib/config";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isLogin = request.nextUrl.pathname === "/admin/login";
  const isAdminApi = request.nextUrl.pathname.startsWith("/api/admin");
  const deny = () => {
    const destination = request.nextUrl.clone();
    destination.pathname = "/admin/login";
    destination.search = "";
    const denied = isAdminApi
      ? NextResponse.json(
          { error: "관리자 로그인이 필요합니다." },
          { status: 401 },
        )
      : NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie));
    denied.headers.set("Cache-Control", "private, no-store");
    return denied;
  };
  if (!isSupabaseConfigured) return isLogin ? response : deny();
  const client = createServerClient(supabaseUrl, publicSupabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!isLogin) {
    if (!user) return deny();
    const { data } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (data?.role !== "admin") return deny();
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
