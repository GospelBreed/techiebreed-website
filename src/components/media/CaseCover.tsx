import Image from "next/image";
import { Play } from "lucide-react";
import { CaseArt } from "@/components/illustrations/CaseArt";
import type { CaseStudy } from "@/lib/content";

/** Card cover for a case study: the video poster with a play badge, or the drawn illustration. */
export function CaseCover({ cs }: { cs: CaseStudy }) {
  if (!cs.video) return <CaseArt kind={cs.art} />;
  return (
    <div className="relative size-full">
      <Image
        src={cs.video.poster}
        alt=""
        fill
        sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
        className="object-cover object-top"
      />
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-night/80 px-3 py-1.5 font-pill text-[12.5px] font-semibold text-white backdrop-blur-sm">
        <Play aria-hidden className="size-3.5 fill-current" />
        Watch{cs.video.duration ? ` · ${cs.video.duration}` : ""}
      </span>
    </div>
  );
}
