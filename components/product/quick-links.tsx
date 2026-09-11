"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import { Media } from "@/components/media";
import type { Category, Product, Video, VideoProduct } from "@/types";

type Props = {
  products: Product[];
  categories: Category[];
  videos?: Video[];
  links?: VideoProduct[];
  videoId?: string;
  filter?: boolean;
  preserveOrder?: boolean;
};
export function ProductQuickLinks({
  products,
  categories,
  videos = [],
  links = [],
  videoId,
  filter = false,
  preserveOrder = false,
}: Props) {
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const pointerOutside = useRef(false);
  const headingId = useId();
  const listId = useId();
  const publicProducts = products.filter((p) => p.published);
  const ordered = preserveOrder
    ? publicProducts
    : [...publicProducts].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.created_at.localeCompare(a.created_at),
      );
  const visible = ordered.filter(
    (p) => !category || p.category_id === category,
  );
  useEffect(() => {
    if (!selected) return;
    const modal = dialog.current;
    const trigger = opener.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal?.showModal();
    return () => {
      modal?.close();
      document.body.style.overflow = previous;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [selected]);
  const related = selected
    ? videos.filter(
        (v) =>
          v.published &&
          (videoId
            ? v.id === videoId
            : links.some(
                (l) => l.product_id === selected.id && l.video_id === v.id,
              )),
      )
    : [];
  const close = () => setSelected(null);
  const outside = (
    event:
      | React.PointerEvent<HTMLDialogElement>
      | React.MouseEvent<HTMLDialogElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  };
  return (
    <div className="quick-links">
      {filter && (
        <nav className="quick-categories" aria-label="핫템 카테고리 필터">
          <button
            type="button"
            aria-pressed={!category}
            aria-controls={listId}
            onClick={() => setCategory("")}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              aria-controls={listId}
              onClick={() => setCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </nav>
      )}
      <p className="quick-count" role="status">
        핫템 {visible.length}개
      </p>
      <ul className="quick-list" id={listId}>
        {visible.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="quick-product"
              data-product-id={p.id}
              aria-haspopup="dialog"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setSelected(p);
              }}
            >
              <span className="quick-name">{p.name}</span>
              {categories.find((c) => c.id === p.category_id) && (
                <span className="quick-badge">
                  {categories.find((c) => c.id === p.category_id)!.name}
                </span>
              )}
              <ChevronRight size={19} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {!visible.length && (
        <p className="quick-empty">
          {category
            ? "이 카테고리에 등록된 핫템이 아직 없어요."
            : "아직 등록된 핫템이 없어요."}
        </p>
      )}
      <dialog
        ref={dialog}
        className="product-popup"
        aria-labelledby={headingId}
        onCancel={close}
        onClose={close}
        onPointerDown={(e) => {
          pointerOutside.current = outside(e);
        }}
        onClick={(e) => {
          if (pointerOutside.current && outside(e)) close();
          pointerOutside.current = false;
        }}
      >
        {selected && (
          <>
            <div className="sheet-handle" aria-hidden="true" />
            <button
              type="button"
              className="popup-close"
              aria-label="상품 팝업 닫기"
              onClick={close}
              autoFocus
            >
              <X size={22} />
            </button>
            <span className="eyebrow">HOT ITEM LOG</span>
            <h2 id={headingId}>{selected.name}</h2>
            {selected.image_url && (
              <div className="popup-image">
                <Media
                  src={selected.image_url}
                  alt={selected.name}
                  sizes="180px"
                />
              </div>
            )}
            {selected.short_description && (
              <p className="popup-note">{selected.short_description}</p>
            )}
            {related.length > 0 && (
              <div className="popup-video">
                <span>이 핫템이 나온 영상</span>
                <Link href={`/video/${related[0].slug}`} onClick={close}>
                  {related[0].title}
                </Link>
                {related.length > 1 && (
                  <small>외 {related.length - 1}개 영상</small>
                )}
              </div>
            )}
            <a
              className="button popup-cta"
              href={`/go/${selected.id}${videoId ? `?video=${videoId}` : ""}`}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              쿠팡에서 보기 <ArrowUpRight size={19} />
            </a>
            <p className="popup-disclosure">
              이 링크를 통해 구매 시 일정액의 수수료를 제공받을 수 있습니다.
            </p>
          </>
        )}
      </dialog>
    </div>
  );
}
