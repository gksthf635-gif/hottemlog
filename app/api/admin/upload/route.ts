import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { serverSupabase } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/config";
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
  if (Number(request.headers.get("content-length") || 0) > 5 * 1024 * 1024)
    return NextResponse.json(
      { error: "5MB 이하의 이미지를 선택해 주세요." },
      { status: 413 },
    );
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return NextResponse.json(
        { error: "5MB 이하 JPG, PNG, WebP 이미지만 업로드할 수 있습니다." },
        { status: 400 },
      );
    const input = Buffer.from(await file.arrayBuffer());
    const pipeline = sharp(input, {
      limitInputPixels: 25_000_000,
      failOn: "warning",
    });
    const metadata = await pipeline.metadata();
    if (
      !["jpeg", "png", "webp"].includes(metadata.format || "") ||
      (metadata.pages || 1) > 1
    )
      return NextResponse.json(
        { error: "정지 이미지만 사용할 수 있습니다." },
        { status: 400 },
      );
    const output = await pipeline
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    const path = `${user.id}/${crypto.randomUUID()}.webp`;
    const { error } = await client.storage
      .from("site-images")
      .upload(path, output, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });
    if (error)
      return NextResponse.json(
        {
          error: "업로드하지 못했습니다. Storage 버킷과 정책을 확인해 주세요.",
        },
        { status: 500 },
      );
    const { data } = client.storage.from("site-images").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch {
    return NextResponse.json(
      { error: "이미지 파일을 읽지 못했습니다. 다른 파일을 선택해 주세요." },
      { status: 400 },
    );
  }
}
