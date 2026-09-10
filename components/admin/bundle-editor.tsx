import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { getCatalog } from "@/lib/data/catalog";
import { BundleForm } from "./bundle-form";
export async function BundleEditor({ id }: { id?: string }) {
  await requireAdmin();
  const catalog = await getCatalog(true);
  const video = catalog.videos.find((v) => v.id === id);
  if (id && !video) notFound();
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">CONTENTS</span>
          <h1>{video ? "콘텐츠 수정" : "새 콘텐츠 등록"}</h1>
          <p>영상 정보와 상품을 입력하고 한 번에 저장하세요.</p>
        </div>
      </div>
      <BundleForm catalog={catalog} video={video} />
    </>
  );
}
