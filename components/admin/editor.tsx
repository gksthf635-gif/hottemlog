import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { getCatalog } from "@/lib/data/catalog";
import { ContentForm } from "@/components/admin/forms";
export async function Editor({
  kind,
  id,
}: {
  kind: "products" | "videos";
  id: string;
}) {
  await requireAdmin();
  const c = await getCatalog(true);
  const item = (kind === "products" ? c.products : c.videos).find(
    (x) => x.id === id,
  );
  if (id !== "new" && !item) notFound();
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">{kind.toUpperCase()}</span>
          <h1>
            {kind === "products" ? "상품" : "영상"} {item ? "수정" : "등록"}
          </h1>
          <p>별표(*)가 있는 항목을 채운 뒤 저장해 주세요.</p>
        </div>
      </div>
      <ContentForm key={id} kind={kind} item={item} catalog={c} />
    </>
  );
}
