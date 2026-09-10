"use client";
import Image from "next/image";
import { isCatalogImage } from "@/lib/remote-image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
export function Media({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const candidates = [
    src,
    ...(src.includes("/maxresdefault.jpg") &&
    src.startsWith("https://img.youtube.com/")
      ? [src.replace("/maxresdefault.jpg", "/hqdefault.jpg")]
      : []),
  ];
  const resolved = candidates.find((url) => !failed.includes(url)) || "";
  const allowed = isCatalogImage(src);
  return allowed && resolved ? (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed((values) => [...values, resolved])}
    />
  ) : (
    <div className="media-fallback">
      <ImageIcon size={32} />
      <span>{alt}</span>
    </div>
  );
}
