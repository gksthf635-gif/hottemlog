import { BundleEditor } from "@/components/admin/bundle-editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <BundleEditor id={(await params).id} />;
}
