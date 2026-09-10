"use client";
import Image from "next/image";
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
  const [failed, setFailed] = useState("");
  let allowed = false;
  try {
    const url = new URL(src);
    const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
    allowed =
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (["images.unsplash.com", "img.youtube.com"].includes(url.hostname) ||
        (!!storage &&
          url.origin === new URL(storage).origin &&
          url.pathname.startsWith("/storage/v1/object/public/site-images/")));
  } catch {
    allowed = false;
  }
  return allowed && failed !== src ? (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(src)}
    />
  ) : (
    <div className="media-fallback">
      <ImageIcon size={32} />
      <span>{alt}</span>
    </div>
  );
}
