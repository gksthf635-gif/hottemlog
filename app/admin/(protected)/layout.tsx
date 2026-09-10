import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/shell";
export const metadata = {
  title: "핫템로그 관리자",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();
  return (
    <AdminShell name={profile.display_name || "한솔"}>{children}</AdminShell>
  );
}
