import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
export const requireAdmin = cache(async () => {
  if (!isSupabaseConfigured) redirect("/admin/login?reason=setup");
  const client = await serverSupabase();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const { data: profile } = await client
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/admin/login?reason=forbidden");
  return { client, user, profile };
});
