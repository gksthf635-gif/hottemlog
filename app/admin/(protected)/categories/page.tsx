import { requireAdmin } from "@/lib/auth/admin";
import { getCatalog } from "@/lib/data/catalog";
import { CategoryForm, ItemActions } from "@/components/admin/forms";
export default async function Categories() {
  await requireAdmin();
  const c = await getCatalog(true);
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">CATEGORIES</span>
          <h1>카테고리 관리</h1>
          <p>
            작은 순서 번호가 먼저 보입니다. 삭제해도 상품은 미분류로 남아요.
          </p>
        </div>
      </div>
      <CategoryForm />
      <div className="category-admin-list">
        {c.categories.map((cat) => (
          <section key={cat.id}>
            <CategoryForm category={cat} />
            <ItemActions kind="categories" id={cat.id} name={cat.name} />
          </section>
        ))}
      </div>
    </>
  );
}
