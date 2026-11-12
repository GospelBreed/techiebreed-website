import { CalendarClock } from "lucide-react";
import { site } from "@/lib/site";

/** The Cal.com page from NEXT_PUBLIC_BOOKING_URL, embedded inline. */
function embedSrc(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    url.searchParams.set("embed", "true");
    url.searchParams.set("theme", "light");
    url.searchParams.set("layout", "month_view");
    return url.toString();
  } catch {
    return null;
  }
}

export function BookingEmbed() {
  const src = site.bookingUrl ? embedSrc(site.bookingUrl) : null;

  if (!src) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[20px] border border-dashed border-forest/30 bg-white p-8 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-mint text-forest">
          <CalendarClock aria-hidden className="size-7" strokeWidth={1.75} />
        </span>
        <p className="mt-5 text-[19px] font-bold text-forest">Online booking is coming soon</p>
        <p className="mt-2 max-w-[340px] text-[15px] leading-[1.6] text-ink-soft">
          For now, send us the form on this page and choose &ldquo;AI Operations Audit&rdquo; — we&rsquo;ll reply with times
          that suit you.
        </p>
        <p className="mt-4 font-mono text-[12px] text-muted">[BOOKING LINK — set NEXT_PUBLIC_BOOKING_URL]</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-line bg-white">
      <iframe
        src={src}
        title="Book an AI Operations Audit"
        loading="lazy"
        className="block h-[720px] w-full border-0"
        allow="payment"
      />
      <p className="border-t border-line px-4 py-3 text-[13.5px] text-muted">
        Calendar not loading?{" "}
        <a href={site.bookingUrl} className="font-semibold text-leaf underline underline-offset-4 hover:text-forest">
          Open the booking page
        </a>
        .
      </p>
    </div>
  );
}
