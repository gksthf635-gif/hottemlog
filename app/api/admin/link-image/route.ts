import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/config";
import {
  allowedMetadataPage,
  extractImage,
  normalizeHttps,
} from "@/lib/remote-image";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(siteUrl).origin)
    return NextResponse.json(
      { error: "허용되지 않은 요청입니다." },
      { status: 403 },
    );
  const client = await serverSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 },
    );
  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다." },
      { status: 403 },
    );
  try {
    const body = await request.json();
    const kind = body.kind === "product" ? "product" : "video";
    let url = normalizeHttps(String(body.url || ""));
    const signal = AbortSignal.timeout(10000);
    for (let i = 0; i < 5; i++) {
      if (!allowedMetadataPage(url, kind))
        return NextResponse.json(
          { error: "지원하는 링크를 입력해 주세요." },
          { status: 400 },
        );
      const res = await fetch(url, {
        redirect: "manual",
        signal,
        cache: "no-store",
      });
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        await res.body?.cancel();
        if (!location) break;
        url = new URL(location, url).href;
        continue;
      }
      if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
        await res.body?.cancel();
        break;
      }
      const reader = res.body?.getReader();
      if (!reader) break;
      const decoder = new TextDecoder();
      let html = "";
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 2_000_000) break;
          html += decoder.decode(value, { stream: true });
          if (html.includes("</head>")) break;
        }
      } finally {
        await reader.cancel();
      }
      const image = extractImage(html);
      if (image) return NextResponse.json({ image });
      break;
    }
  } catch {
    /* Upstream sites may not provide public metadata. */
  }
  return NextResponse.json({
    image: "",
    message: "링크에서 이미지를 제공하지 않아 자동으로 가져오지 못했어요.",
  });
}
