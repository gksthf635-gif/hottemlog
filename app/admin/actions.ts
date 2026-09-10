"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { serverSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import {
  productSchema,
  videoSchema,
  categorySchema,
  settingsSchema,
  linksSchema,
} from "@/lib/validation";
import { slugify, youtubeThumbnail } from "@/lib/utils";
import type { FormState } from "@/types";
const value = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();
const lines = (s: string) =>
  s
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
function fail(error: unknown): FormState {
  if (error instanceof z.ZodError)
    return {
      ok: false,
      message: error.issues[0]?.message || "입력 내용을 확인해 주세요.",
    };
  const code = (error as { code?: string })?.code;
  return {
    ok: false,
    message:
      code === "23505"
        ? "이미 사용 중인 이름 또는 주소입니다. 다른 값을 입력해 주세요."
        : code === "23503"
          ? "연결 대상이 변경되었습니다. 새로고침 후 다시 저장해 주세요."
          : "저장하지 못했습니다. 연결 상태와 관리자 권한을 확인해 주세요.",
  };
}
export async function login(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured)
    return {
      ok: false,
      message: "먼저 .env.local에 Supabase 환경변수를 설정해 주세요.",
    };
  const email = value(form, "email");
  const password = String(form.get("password") || "");
  if (!z.email().safeParse(email).success || !password)
    return { ok: false, message: "이메일과 비밀번호를 확인해 주세요." };
  const client = await serverSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user)
    return {
      ok: false,
      message:
        "로그인 정보를 확인해 주세요. 시도가 많으면 잠시 후 다시 시도해 주세요.",
    };
  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (profile?.role !== "admin") {
    await client.auth.signOut();
    return { ok: false, message: "관리자 권한이 없는 계정입니다." };
  }
  revalidatePath("/admin", "layout");
  redirect("/admin");
}
export async function logout() {
  const client = await serverSupabase();
  await client.auth.signOut();
  redirect("/admin/login");
}
export async function saveContent(
  kind: "products" | "videos",
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const { client } = await requireAdmin();
  try {
    const common = {
      id: value(form, "id") || undefined,
      slug:
        value(form, "slug") ||
        slugify(value(form, kind === "products" ? "name" : "title")),
      published: form.has("published"),
      featured: form.has("featured"),
      tags: lines(value(form, "tags")),
    };
    const linkedIds = linksSchema.parse(form.getAll("linkedIds"));
    const payload =
      kind === "products"
        ? productSchema.parse({
            ...common,
            name: value(form, "name"),
            category_id: value(form, "category_id") || null,
            image_url: value(form, "image_url"),
            short_description: value(form, "short_description"),
            description: value(form, "description"),
            recommendation: value(form, "recommendation"),
            recommend_points: value(form, "recommend_points")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            affiliate_url: value(form, "affiliate_url"),
          })
        : videoSchema.parse({
            ...common,
            title: value(form, "title"),
            platform: value(form, "platform"),
            video_url: value(form, "video_url"),
            thumbnail_url:
              value(form, "thumbnail_url") ||
              youtubeThumbnail(value(form, "video_url")),
            description: value(form, "description"),
            sort_order: Number(value(form, "sort_order") || 0),
            published_at: value(form, "published_at")
              ? new Date(`${value(form, "published_at")}+09:00`).toISOString()
              : new Date().toISOString(),
          });
    const { data, error } = await client.rpc(
      kind === "products" ? "save_product" : "save_video",
      { payload, linked_ids: linkedIds },
    );
    if (error) return fail(error);
    revalidatePath("/", "layout");
    return {
      ok: true,
      message: "저장했습니다. 홈페이지에 바로 반영됩니다.",
      id: data,
    };
  } catch (error) {
    return fail(error);
  }
}
export async function saveCategory(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const { client } = await requireAdmin();
  try {
    const payload = categorySchema.parse({
      id: value(form, "id") || undefined,
      name: value(form, "name"),
      slug: value(form, "slug") || slugify(value(form, "name")),
      sort_order: Number(value(form, "sort_order") || 0),
    });
    const { data, error } = await client
      .from("categories")
      .upsert(payload)
      .select("id")
      .single();
    if (error) return fail(error);
    revalidatePath("/", "layout");
    return { ok: true, message: "카테고리를 저장했습니다.", id: data.id };
  } catch (error) {
    return fail(error);
  }
}
export async function saveSettings(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const { client } = await requireAdmin();
  try {
    const payload = settingsSchema.parse(
      Object.fromEntries(
        Object.keys(settingsSchema.shape).map((key) => [key, value(form, key)]),
      ),
    );
    const { error } = await client
      .from("settings")
      .upsert({ id: 1, ...payload });
    if (error) return fail(error);
    revalidatePath("/", "layout");
    return { ok: true, message: "사이트 설정을 저장했습니다." };
  } catch (error) {
    return fail(error);
  }
}
export async function manageItem(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const { client } = await requireAdmin();
  const id = value(form, "id");
  const kind = z
    .enum(["products", "videos", "categories"])
    .safeParse(value(form, "kind"));
  if (!kind.success || !z.uuid().safeParse(id).success)
    return { ok: false, message: "잘못된 요청입니다." };
  const action = value(form, "operation");
  if (
    !["delete", "publish", "feature"].includes(action) ||
    (kind.data === "categories" && action !== "delete")
  )
    return { ok: false, message: "잘못된 작업입니다." };
  const query =
    action === "delete"
      ? client.from(kind.data).delete().eq("id", id)
      : client
          .from(kind.data)
          .update({
            [action === "publish" ? "published" : "featured"]:
              value(form, "value") === "true",
          })
          .eq("id", id);
  const { data, error } = await query.select("id");
  if (error) return fail(error);
  if (!data?.length)
    return {
      ok: false,
      message: "대상을 찾을 수 없습니다. 새로고침해 주세요.",
    };
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: action === "delete" ? "삭제했습니다." : "변경사항을 저장했습니다.",
  };
}
