import { NextRequest, NextResponse } from "next/server";
import { publicSupabase, secretSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { isAffiliateUrl, safeReferrer } from "@/lib/utils";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  if (!z.uuid().safeParse(productId).success)
    return new NextResponse("상품을 찾을 수 없습니다.", { status: 404 });
  if (!isSupabaseConfigured)
    return new NextResponse(
      "샘플 상품입니다. 실제 쿠팡 링크는 Supabase 연결 후 관리자에서 등록해 주세요.",
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  const client = publicSupabase();
  const { data: product, error } = await client
    .from("products")
    .select("id,affiliate_url")
    .eq("id", productId)
    .eq("published", true)
    .maybeSingle();
  if (error)
    return new NextResponse("잠시 후 다시 시도해 주세요.", { status: 503 });
  if (!product || !isAffiliateUrl(product.affiliate_url))
    return new NextResponse("상품을 찾을 수 없습니다.", { status: 404 });
  let videoId: string | null = null;
  const video = request.nextUrl.searchParams.get("video");
  if (video && z.uuid().safeParse(video).success) {
    const { data } = await client
      .from("video_products")
      .select("video_id")
      .eq("product_id", productId)
      .eq("video_id", video)
      .maybeSingle();
    if (data) videoId = data.video_id;
  }
  const ua = request.headers.get("user-agent") || "";
  const preview =
    request.headers.get("purpose") === "prefetch" ||
    request.headers.has("next-router-prefetch") ||
    /bot|crawler|spider|facebookexternalhit|kakaotalk-scrap/i.test(ua);
  if (!preview) {
    try {
      const { error: clickError } = await secretSupabase()
        .from("clicks")
        .insert({
          product_id: productId,
          video_id: videoId,
          referrer: safeReferrer(request.headers.get("referer")),
          user_agent: ua.slice(0, 350) || null,
        });
      if (clickError)
        console.error("Click tracking insert failed", clickError.code);
    } catch {
      console.error(
        "Click tracking unavailable: check server-only Supabase key.",
      );
    }
  }
  return NextResponse.redirect(product.affiliate_url, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
}
export async function HEAD() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
