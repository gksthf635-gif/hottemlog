"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  saveContent,
  saveCategory,
  saveSettings,
  login,
  manageItem,
} from "@/app/admin/actions";
import { youtubeThumbnail } from "@/lib/utils";
import { Media } from "@/components/media";
import type {
  Product,
  Video,
  Category,
  Settings,
  Catalog,
  FormState,
} from "@/types";
const initial: FormState = { ok: false, message: "" };
function Notice({ state }: { state: FormState }) {
  return state.message ? (
    <div
      className={`toast ${state.ok ? "success" : "failure"}`}
      role={state.ok ? "status" : "alert"}
    >
      {state.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{state.message}</span>
    </div>
  ) : null;
}
function Field({
  label,
  name,
  value = "",
  required = false,
  multiline = false,
  hint,
  type = "text",
  maxLength,
}: {
  label: string;
  name: string;
  value?: string | number;
  required?: boolean;
  multiline?: boolean;
  hint?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={value}
          required={required}
          rows={4}
          maxLength={maxLength}
        />
      ) : (
        <input
          name={name}
          defaultValue={value}
          required={required}
          type={type}
          maxLength={maxLength}
        />
      )}{" "}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function ImageUpload({
  name,
  label,
  initialUrl = "",
  automaticUrl = "",
  onBusy,
}: {
  name: string;
  label: string;
  initialUrl?: string;
  automaticUrl?: string;
  onBusy: (busy: boolean) => void;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    onBusy(true);
    setMessage("");
    try {
      if (file.size > 4 * 1024 * 1024)
        throw new Error("4MB 이하 이미지를 선택해 주세요.");
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setUrl(result.url);
      setMessage("업로드 완료. 아래 저장 버튼을 누르면 반영됩니다.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "이미지 업로드에 실패했습니다.",
      );
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }
  return (
    <div className="field">
      <span>{label}</span>
      {(url || automaticUrl) && (
        <div className="upload-preview">
          <Media
            key={url || automaticUrl}
            src={url || automaticUrl}
            alt={label}
            sizes="160px"
          />
        </div>
      )}
      <input
        name={name}
        aria-label={`${label} 주소`}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={automaticUrl || "이미지를 업로드해 주세요."}
        maxLength={2048}
      />
      <label className="upload-button">
        <Upload size={18} />
        {busy ? "이미지 최적화 중…" : "이미지 선택"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </label>
      <small>
        JPG · PNG · WebP, 4MB 이하. 자동으로 크기와 용량을 줄입니다.
      </small>
      {automaticUrl && !url && (
        <small>
          YouTube 썸네일이 자동 적용됩니다. 표시되지 않으면 직접 업로드하세요.
        </small>
      )}
      {message && (
        <p role="status" className="field-message">
          {message}
        </p>
      )}
    </div>
  );
}
function LinkedPicker({
  options,
  initialIds,
}: {
  options: { id: string; label: string }[];
  initialIds: string[];
}) {
  const [ids, setIds] = useState(initialIds);
  const [search, setSearch] = useState("");
  function toggle(id: string) {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function move(index: number, delta: number) {
    setIds((prev) => {
      const next = [...prev];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  }
  return (
    <div className="linked-picker">
      <input
        aria-label="연결할 항목 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="이름으로 빠르게 찾기"
      />
      <div className="linked-options">
        {options
          .filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
          .map((o) => (
            <label className="check-row" key={o.id}>
              <input
                type="checkbox"
                checked={ids.includes(o.id)}
                onChange={() => toggle(o.id)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        {!options.length && <p>먼저 연결할 콘텐츠를 등록해 주세요.</p>}
      </div>
      {ids.length > 0 && (
        <ol className="selected-links">
          {ids.map((id, i) => (
            <li key={id}>
              <input type="hidden" name="linkedIds" value={id} />
              <span>{options.find((o) => o.id === id)?.label || id}</span>
              <button
                type="button"
                aria-label={`${i + 1}번째 항목 위로`}
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                aria-label={`${i + 1}번째 항목 아래로`}
                onClick={() => move(i, 1)}
                disabled={i === ids.length - 1}
              >
                <ArrowDown size={16} />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
export function ContentForm({
  kind,
  item,
  catalog,
}: {
  kind: "products" | "videos";
  item?: Product | Video;
  catalog: Catalog;
}) {
  const [state, action, pending] = useActionState(
    saveContent.bind(null, kind),
    initial,
  );
  const [uploading, setUploading] = useState(false);
  const [platform, setPlatform] = useState(
    (item as Video)?.platform || "instagram",
  );
  const [videoUrl, setVideoUrl] = useState((item as Video)?.video_url || "");
  const router = useRouter();
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);
  const p = kind === "products" ? (item as Product | undefined) : undefined;
  const v = kind === "videos" ? (item as Video | undefined) : undefined;
  const ids = catalog.links
    .filter((l) =>
      kind === "products" ? l.product_id === item?.id : l.video_id === item?.id,
    )
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((l) => (kind === "products" ? l.video_id : l.product_id));
  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="id" value={item?.id || state.id || ""} />
      <Notice state={state} />
      <div className="form-panel">
        <h2>기본 정보</h2>
        {kind === "products" ? (
          <>
            <Field
              label="상품명"
              name="name"
              value={p?.name}
              required
              maxLength={120}
            />
            <label className="field">
              <span>카테고리</span>
              <select name="category_id" defaultValue={p?.category_id || ""}>
                <option value="">미분류</option>
                {catalog.categories.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <ImageUpload
              name="image_url"
              label="상품 이미지"
              initialUrl={p?.image_url}
              onBusy={setUploading}
            />
            <Field
              label="한솔의 한줄평"
              name="short_description"
              value={p?.short_description}
              maxLength={180}
            />
            <Field
              label="상세 설명"
              name="description"
              value={p?.description}
              multiline
              maxLength={10000}
            />
            <Field
              label="추천 이유"
              name="recommendation"
              value={p?.recommendation}
              multiline
              maxLength={2000}
            />
            <Field
              label="추천 포인트"
              name="recommend_points"
              value={p?.recommend_points.join("\n")}
              multiline
              hint="한 줄에 한 가지씩 적어 주세요. 최대 20개."
            />
            <Field
              label="쿠팡파트너스 링크"
              name="affiliate_url"
              value={p?.affiliate_url}
              required
              type="url"
              maxLength={2048}
              hint="쿠팡파트너스에서 만든 https://link.coupang.com/… 링크를 붙여넣으세요."
            />
          </>
        ) : (
          <>
            <label className="field">
              <span>플랫폼 *</span>
              <select
                name="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="instagram">Instagram Reel</option>
                <option value="youtube">YouTube Shorts</option>
              </select>
            </label>
            <Field
              label="영상 제목"
              name="title"
              value={v?.title}
              required
              maxLength={120}
            />
            <label className="field">
              <span>영상 URL *</span>
              <input
                type="url"
                name="video_url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
                maxLength={2048}
              />
            </label>
            <ImageUpload
              name="thumbnail_url"
              label="영상 썸네일"
              initialUrl={v?.thumbnail_url}
              automaticUrl={
                platform === "youtube" ? youtubeThumbnail(videoUrl) : ""
              }
              onBusy={setUploading}
            />
            <Field
              label="영상 설명"
              name="description"
              value={v?.description}
              multiline
              maxLength={10000}
            />
          </>
        )}
      </div>
      <div className="form-panel">
        <h2>{kind === "products" ? "연결할 영상" : "연결할 상품"}</h2>
        <p className="form-hint">
          체크하면 연결됩니다.{" "}
          {kind === "videos"
            ? "화살표로 영상 속 상품 순서를 정하세요."
            : "상품 표시 순서는 영상 수정 화면에서 정할 수 있어요."}
        </p>
        <LinkedPicker
          options={
            kind === "products"
              ? catalog.videos.map((x) => ({ id: x.id, label: x.title }))
              : catalog.products.map((x) => ({ id: x.id, label: x.name }))
          }
          initialIds={ids}
        />
      </div>
      <div className="form-panel">
        <h2>공개 설정</h2>
        <Field
          label="페이지 주소"
          name="slug"
          value={item?.slug}
          hint="비워 두면 이름으로 자동 생성합니다. 발행 후 변경 시 이전 주소는 사용할 수 없어요."
          maxLength={100}
        />
        <Field
          label="검색 태그"
          name="tags"
          value={item?.tags.join(", ")}
          hint="쉼표로 구분해 주세요. 예: 정리, 주방, 살림"
        />
        {kind === "videos" && (
          <>
            <Field
              label="정렬 순서"
              name="sort_order"
              type="number"
              value={v?.sort_order || 0}
              hint="작은 숫자가 먼저 표시됩니다."
            />
            <Field
              label="영상 등록일"
              name="published_at"
              type="datetime-local"
              value={
                v?.published_at
                  ? new Date(new Date(v.published_at).getTime() + 9 * 3600000)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              hint="한국 시간 기준. 미래 날짜는 표시용이며 예약 발행 기능은 아닙니다."
            />
          </>
        )}
        <label className="check-row">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={item?.featured}
          />
          <span>한솔의 추천 (Featured)</span>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item?.published}
          />
          <span>홈페이지에 공개하기</span>
        </label>
      </div>
      <Notice state={state} />
      <div className="form-actions">
        <Link href={`/admin/${kind}`} className="button secondary">
          목록으로
        </Link>
        <button
          type="submit"
          className="button"
          disabled={pending || uploading}
        >
          {pending ? "저장 중…" : "저장하기"}
        </button>
      </div>
    </form>
  );
}
export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="login-form">
      <Field label="이메일" name="email" type="email" required />
      <label className="field">
        <span>비밀번호 *</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      <Notice state={state} />
      <button className="button" disabled={pending || !configured}>
        {pending ? "로그인 중…" : "관리자 로그인"}
      </button>
    </form>
  );
}
export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategory, initial);
  return (
    <form className="form-panel category-form" action={action}>
      <input type="hidden" name="id" value={category?.id || ""} />
      <Field
        label="카테고리명"
        name="name"
        value={category?.name}
        required
        maxLength={40}
      />
      <Field label="주소" name="slug" value={category?.slug} maxLength={100} />
      <Field
        label="순서"
        name="sort_order"
        value={category?.sort_order || 0}
        type="number"
      />
      <button className="button secondary" disabled={pending}>
        {pending ? "저장 중…" : category ? "수정 저장" : "카테고리 추가"}
      </button>
      <Notice state={state} />
    </form>
  );
}
export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(saveSettings, initial);
  const [uploading, setUploading] = useState(false);
  return (
    <form className="admin-form" action={action}>
      <Notice state={state} />
      <div className="form-panel">
        <h2>브랜드와 연락처</h2>
        <Field
          label="사이트명"
          name="site_name"
          value={settings.site_name}
          required
          maxLength={50}
        />
        <Field
          label="사이트 설명"
          name="site_description"
          value={settings.site_description}
          required
          multiline
          maxLength={500}
        />
        <ImageUpload
          name="logo_url"
          label="로고 이미지"
          initialUrl={settings.logo_url}
          onBusy={setUploading}
        />
        <Field
          label="Instagram URL"
          name="instagram_url"
          value={settings.instagram_url}
          type="url"
        />
        <Field
          label="YouTube URL"
          name="youtube_url"
          value={settings.youtube_url}
          type="url"
        />
        <Field
          label="문의 이메일"
          name="contact_email"
          value={settings.contact_email}
          type="email"
        />
      </div>
      <div className="form-panel">
        <h2>고지와 검색 노출</h2>
        <Field
          label="쿠팡파트너스 제휴 고지"
          name="affiliate_disclosure"
          value={settings.affiliate_disclosure}
          required
          multiline
          maxLength={2000}
        />
        <Field
          label="Footer 문구"
          name="footer_text"
          value={settings.footer_text}
          required
          maxLength={300}
        />
        <Field
          label="기본 SEO 제목"
          name="default_seo_title"
          value={settings.default_seo_title}
          required
          maxLength={120}
        />
        <Field
          label="기본 SEO 설명"
          name="default_seo_description"
          value={settings.default_seo_description}
          required
          multiline
          maxLength={500}
        />
      </div>
      <Notice state={state} />
      <button className="button" disabled={pending || uploading}>
        {pending ? "저장 중…" : "설정 저장"}
      </button>
    </form>
  );
}
export function ItemActions({
  kind,
  id,
  name,
  published,
  featured,
}: {
  kind: "products" | "videos" | "categories";
  id: string;
  name: string;
  published?: boolean;
  featured?: boolean;
}) {
  const [state, action, pending] = useActionState(manageItem, initial);
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      dialog.current?.close();
      router.refresh();
    }
  }, [state, router]);
  const hidden = (
    <>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
    </>
  );
  return (
    <div className="item-actions">
      {kind !== "categories" && (
        <>
          <Link
            className="button secondary small"
            href={
              kind === "videos"
                ? `/admin/contents/${id}/edit`
                : `/admin/${kind}/${id}`
            }
          >
            수정
          </Link>
          <form action={action}>
            {hidden}
            <input type="hidden" name="operation" value="publish" />
            <input type="hidden" name="value" value={String(!published)} />
            <button className="button secondary small" disabled={pending}>
              {published ? "비공개로" : "공개하기"}
            </button>
          </form>
          <form action={action}>
            {hidden}
            <input type="hidden" name="operation" value="feature" />
            <input type="hidden" name="value" value={String(!featured)} />
            <button className="button secondary small" disabled={pending}>
              {featured ? "추천 해제" : "추천 지정"}
            </button>
          </form>
        </>
      )}
      <button
        className="delete-link"
        type="button"
        onClick={() => dialog.current?.showModal()}
      >
        삭제
      </button>
      <dialog
        ref={dialog}
        className="confirm-dialog"
        aria-labelledby={`delete-${id}`}
      >
        <h2 id={`delete-${id}`}>삭제하시겠어요?</h2>
        <p>
          “{name}”을 삭제합니다. 연결은 해제되며 되돌릴 수 없습니다.
          {kind === "categories" ? " 소속 상품은 미분류로 유지됩니다." : ""}
        </p>
        <form action={action}>
          {hidden}
          <input type="hidden" name="operation" value="delete" />
          <Notice state={state} />
          <div className="form-actions">
            <button
              className="button secondary"
              type="button"
              autoFocus
              onClick={() => dialog.current?.close()}
            >
              취소
            </button>
            <button className="button danger" disabled={pending}>
              {pending ? "삭제 중…" : "삭제하기"}
            </button>
          </div>
        </form>
      </dialog>
      <Notice state={state} />
    </div>
  );
}
