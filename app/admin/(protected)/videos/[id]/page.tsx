import { Editor } from "@/components/admin/editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Editor kind="videos" id={(await params).id} />;
}
