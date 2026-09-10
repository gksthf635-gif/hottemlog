"use client";
import { useEffect, useState } from "react";
import { ImageUpload } from "./forms";
import { normalizeHttps, allowedMetadataPage } from "@/lib/remote-image";
import { youtubeThumbnail } from "@/lib/utils";
export function AutomaticImage({
  name,
  label,
  url,
  kind,
  initialUrl = "",
  fallback = "",
  onBusy,
}: {
  name: string;
  label: string;
  url: string;
  kind: "video" | "product";
  initialUrl?: string;
  fallback?: string;
  onBusy: (b: boolean) => void;
}) {
  const [result, setResult] = useState({ source: "", image: "", message: "" });
  const normalized = normalizeHttps(url);
  const youtube = kind === "video" ? youtubeThumbnail(normalized) : "";
  const canLookup = !youtube && allowedMetadataPage(normalized, kind);
  useEffect(() => {
    if (!canLookup) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResult({
        source: normalized,
        image: "",
        message: "링크에서 이미지 확인 중…",
      });
      try {
        const r = await fetch("/api/admin/link-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalized, kind }),
          signal: controller.signal,
        });
        const data = await r.json();
        if (!controller.signal.aborted)
          setResult({
            source: normalized,
            image: data.image || "",
            message: data.image
              ? "링크의 이미지를 자동으로 적용했어요."
              : data.message || data.error || "이미지를 가져오지 못했어요.",
          });
      } catch {
        if (!controller.signal.aborted)
          setResult({
            source: normalized,
            image: "",
            message: "이미지를 가져오지 못했어요. 직접 업로드할 수 있습니다.",
          });
      }
    }, 700);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalized, kind, canLookup]);
  const current = result.source === normalized ? result : null;
  const automatic = youtube || current?.image || fallback;
  return (
    <div>
      <ImageUpload
        key={normalized}
        name={name}
        label={label}
        initialUrl={initialUrl}
        automaticUrl={automatic}
        onBusy={onBusy}
      />
      <p className="form-hint" role="status">
        {youtube
          ? "영상 URL에서 썸네일을 자동 적용합니다."
          : current?.message || "링크를 입력하면 이미지를 자동으로 확인합니다."}
        {kind === "product" && !current?.image && fallback
          ? " 상품 사진을 가져오기 전에는 영상 썸네일을 사용합니다."
          : ""}
      </p>
    </div>
  );
}
export function ProductLinkImage({
  prefix,
  initialLink = "",
  initialImage = "",
  fallback = "",
  onBusy,
}: {
  prefix: string;
  initialLink?: string;
  initialImage?: string;
  fallback?: string;
  onBusy: (b: boolean) => void;
}) {
  const [link, setLink] = useState(initialLink.replace(/^https?:\/\//i, ""));
  const url = normalizeHttps(link);
  return (
    <>
      <label className="field">
        <span>쿠팡파트너스 링크 *</span>
        <div className="https-input">
          <span aria-hidden="true">https://</span>
          <input
            aria-label="쿠팡파트너스 링크"
            value={link}
            onChange={(e) =>
              setLink(e.target.value.replace(/^(?:https?:\/\/)+/i, ""))
            }
            required
            maxLength={2048}
            placeholder="link.coupang.com/a/…"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <input type="hidden" name={`${prefix}:affiliate_url`} value={url} />
        <small>
          https:// 없이 붙여넣어도 됩니다. 전체 링크 붙여넣기도 지원합니다.
        </small>
      </label>
      <AutomaticImage
        name={`${prefix}:image_url`}
        label="상품 이미지"
        kind="product"
        url={url}
        initialUrl={url === normalizeHttps(initialLink) ? initialImage : ""}
        fallback={fallback}
        onBusy={onBusy}
      />
    </>
  );
}
