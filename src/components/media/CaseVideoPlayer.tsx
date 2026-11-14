import type { CaseVideo } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * Native video player for a case study walkthrough.
 * Nothing downloads until the visitor presses play (preload="none"); captions are available from the player menu.
 */
export function CaseVideoPlayer({ video, title, className }: { video: CaseVideo; title: string; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-[20px] bg-night shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)]", className)}>
      <video
        controls
        playsInline
        preload="none"
        poster={video.poster}
        className="block aspect-video w-full bg-night"
        aria-label={`Video walkthrough: ${title}`}
      >
        <source src={video.src} type="video/mp4" />
        {video.captions && <track kind="captions" src={video.captions} srcLang="en" label="English" />}
        Your browser can&rsquo;t play this video.{" "}
        <a href={video.src} className="underline">
          Download it instead
        </a>
        .
      </video>
    </figure>
  );
}
