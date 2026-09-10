import { Editor } from "@/components/admin/editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Editor kind="products" id={(await params).id} />;
}
