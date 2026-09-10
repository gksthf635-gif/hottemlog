import { ContentList } from "@/components/admin/content-list";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <ContentList kind="products" q={(await searchParams).q} />;
}
