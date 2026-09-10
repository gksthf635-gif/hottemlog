"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { saveBundle } from "@/app/admin/actions";
import { ImageUpload } from "./forms";
import { youtubeThumbnail } from "@/lib/utils";
import type { Catalog, Product, Video } from "@/types";
type Row = { key: string; product?: Product };
export function BundleForm({
  catalog,
  video,
}: {
  catalog: Catalog;
  video?: Video;
}) {
  const linked = catalog.links
    .filter((l) => l.video_id === video?.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const [rows, setRows] = useState<Row[]>(
    linked.length
      ? linked.map((l) => ({
          key: l.product_id,
          product: catalog.products.find((p) => p.id === l.product_id),
        }))
      : [{ key: "first" }],
  );
  const [platform, setPlatform] = useState(video?.platform || "youtube");
  const [url, setUrl] = useState(video?.video_url || "");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [state, action, pending] = useActionState(saveBundle, {
    ok: false,
    message: "",
  });
  const uploading = Object.values(busy).some(Boolean);
  function submit(form: FormData) {
    form.set(
      "products",
      JSON.stringify(
        rows.map((r) => ({
          id: String(form.get(`${r.key}:id`) || "") || undefined,
          name: String(form.get(`${r.key}:name`) || ""),
          affiliate_url: String(form.get(`${r.key}:affiliate_url`) || ""),
          image_url: String(form.get(`${r.key}:image_url`) || ""),
          category_id: String(form.get(`${r.key}:category_id`) || "") || null,
          short_description: String(
            form.get(`${r.key}:short_description`) || "",
          ),
        })),
      ),
    );
    action(form);
  }
  return (
    <form action={submit} className="admin-form bundle-form">
      <fieldset disabled={pending || uploading} className="bundle-fields">
        <input type="hidden" name="id" value={video?.id || ""} />
        <section className="form-panel">
          <h2>영상 정보</h2>
          <label className="field">
            <span>플랫폼 *</span>
            <select
              name="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>
          <label className="field">
            <span>영상 URL *</span>
            <input
              name="video_url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              maxLength={2048}
            />
          </label>
          <label className="field">
            <span>영상 제목 *</span>
            <input
              name="title"
              defaultValue={video?.title}
              required
              maxLength={120}
            />
          </label>
          <ImageUpload
            key={platform}
            name="thumbnail_url"
            label="영상 썸네일"
            initialUrl={video?.platform === platform ? video.thumbnail_url : ""}
            automaticUrl={platform === "youtube" ? youtubeThumbnail(url) : ""}
            onBusy={(b) => setBusy((s) => ({ ...s, video: b }))}
          />
          <label className="field">
            <span>게시일</span>
            <input
              type="datetime-local"
              name="published_at"
              defaultValue={
                video
                  ? new Date(
                      new Date(video.published_at).getTime() + 9 * 3600000,
                    )
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
            />
            <small>비워 두면 등록 시각을 사용합니다. 한국 시간 기준.</small>
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              name="published"
              defaultChecked={video?.published ?? true}
            />{" "}
            공개
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={video?.featured}
            />{" "}
            Featured
          </label>
          <p className="form-hint">
            공개로 저장하면 연결 상품도 공개됩니다. 비공개로 변경해도 다른
            영상에서 사용하는 상품은 유지됩니다.
          </p>
        </section>
        <section aria-labelledby="products-heading">
          <h2 id="products-heading">영상 속 상품</h2>
          {rows.map((row, index) => (
            <ProductBlock
              key={row.key}
              row={row}
              index={index}
              catalog={catalog}
              used={rows.flatMap((r) => (r.product ? [r.product.id] : []))}
              onChoose={(p) =>
                setRows((s) =>
                  s.map((r) => (r.key === row.key ? { ...r, product: p } : r)),
                )
              }
              onRemove={() =>
                setRows((s) => s.filter((r) => r.key !== row.key))
              }
              canRemove={rows.length > 1}
              onBusy={(b) => setBusy((s) => ({ ...s, [row.key]: b }))}
            />
          ))}
          <button
            className="button secondary"
            type="button"
            disabled={rows.length >= 100}
            onClick={() => setRows((s) => [...s, { key: crypto.randomUUID() }])}
          >
            + 상품 추가
          </button>
        </section>
      </fieldset>
      {state.message && (
        <div role="alert" className="toast failure">
          {state.message}
        </div>
      )}
      <div className="form-actions bundle-submit">
        <Link href="/admin/contents" className="button secondary">
          목록으로
        </Link>
        <button className="button" disabled={pending || uploading}>
          {pending
            ? "저장 중…"
            : uploading
              ? "이미지 업로드 중…"
              : video
                ? "수정 저장"
                : "등록하기"}
        </button>
      </div>
    </form>
  );
}
function ProductBlock({
  row,
  index,
  catalog,
  used,
  onChoose,
  onRemove,
  canRemove,
  onBusy,
}: {
  row: Row;
  index: number;
  catalog: Catalog;
  used: string[];
  onChoose: (p?: Product) => void;
  onRemove: () => void;
  canRemove: boolean;
  onBusy: (b: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [picker, setPicker] = useState(false);
  const p = row.product;
  return (
    <article className="form-panel bundle-product">
      <h3>상품 {index + 1}</h3>
      <div className="bundle-tools">
        <button
          type="button"
          className="button secondary small"
          onClick={() => setPicker(!picker)}
        >
          기존 상품 선택
        </button>
        {p && (
          <button
            type="button"
            className="button secondary small"
            onClick={() => onChoose(undefined)}
          >
            새 상품 등록
          </button>
        )}
      </div>
      {picker && (
        <div className="bundle-picker">
          <label className="field">
            <span>기존 상품 검색</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상품명 검색"
            />
          </label>
          <div className="bundle-results">
            {catalog.products
              .filter((x) =>
                x.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((x) => (
                <button
                  type="button"
                  key={x.id}
                  disabled={used.includes(x.id)}
                  onClick={() => {
                    onChoose(x);
                    setPicker(false);
                  }}
                >
                  {x.name}
                  {used.includes(x.id) ? " · 선택됨" : ""}
                </button>
              ))}
          </div>
        </div>
      )}
      {p && (
        <p className="form-hint">
          기존 상품을 연결합니다. 상품 정보 수정은 이 상품을 사용하는 다른
          영상에도 반영됩니다.
        </p>
      )}
      <div key={p?.id || "new"}>
        <input type="hidden" name={`${row.key}:id`} value={p?.id || ""} />
        <label className="field">
          <span>상품명 *</span>
          <input
            name={`${row.key}:name`}
            defaultValue={p?.name}
            required
            maxLength={120}
          />
        </label>
        <label className="field">
          <span>쿠팡파트너스 링크 *</span>
          <input
            name={`${row.key}:affiliate_url`}
            defaultValue={p?.affiliate_url}
            type="url"
            required
            maxLength={2048}
            placeholder="https://link.coupang.com/…"
          />
        </label>
        <ImageUpload
          name={`${row.key}:image_url`}
          label={`상품 ${index + 1} 이미지`}
          initialUrl={p?.image_url}
          onBusy={onBusy}
        />
        <label className="field">
          <span>카테고리</span>
          <select
            name={`${row.key}:category_id`}
            defaultValue={p?.category_id || ""}
          >
            <option value="">선택 안 함</option>
            {catalog.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>한줄평</span>
          <input
            name={`${row.key}:short_description`}
            defaultValue={p?.short_description}
            maxLength={180}
          />
        </label>
      </div>
      <button
        className="button secondary small"
        type="button"
        disabled={!canRemove}
        onClick={onRemove}
      >
        상품 삭제
      </button>
    </article>
  );
}
