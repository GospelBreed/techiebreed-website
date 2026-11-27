import Image from "next/image";
import type { Photo } from "@/content-data/photos";

/** A decorative stock photo that fills its (positioned) parent. */
export function StockPhoto({
  photo,
  sizes,
  priority,
}: {
  photo: Photo;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={photo.src}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      style={photo.focus ? { objectPosition: photo.focus } : undefined}
    />
  );
}
