import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { rangeStart, kstDay } from "@/lib/utils";
import type { Analytics } from "@/types";
export async function getAnalytics(range = "7"): Promise<Analytics> {
  const { client } = await requireAdmin();
  const { data, error } = await client.rpc("admin_analytics", {
    since: rangeStart(range),
  });
  if (error) throw new Error("통계를 불러오지 못했습니다.", { cause: error });
  const result = data as Analytics;
  const first =
    rangeStart(range) ||
    (result.daily[0]
      ? new Date(`${result.daily[0].date}T00:00:00+09:00`).toISOString()
      : rangeStart("today")!);
  const counts = new Map(result.daily.map((d) => [d.date, d.count]));
  const cursor = new Date(first);
  const today = kstDay();
  const daily = [];
  while (kstDay(cursor) <= today) {
    const date = kstDay(cursor);
    daily.push({ date, count: counts.get(date) || 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { ...result, daily };
}
