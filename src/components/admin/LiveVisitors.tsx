"use client";

import { useEffect, useState } from "react";
import type { LiveReport } from "@/server/admin/analytics";

type State = { data?: LiveReport; error?: string; loading: boolean };

/** People on the website right now (last 30 minutes). Refreshes every 30 seconds while the tab is open. */
export function LiveVisitors() {
  const [s, setS] = useState<State>({ loading: true });

  useEffect(() => {
    let stop = false;
    async function load() {
      if (document.hidden) return;
      try {
        const res = await fetch("/admin/analytics/live", { cache: "no-store" });
        const body = (await res.json().catch(() => ({}))) as { data?: LiveReport; message?: string };
        if (!stop) setS(res.ok && body.data ? { data: body.data, loading: false } : { error: body.message ?? "Couldn't load live visitors.", loading: false });
      } catch {
        if (!stop) setS((cur) => ({ ...cur, error: "Couldn't reach the website. Check your connection.", loading: false }));
      }
    }
    load();
    const t = setInterval(load, 30_000);
    const onVis = () => !document.hidden && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop = true;
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <section className="rounded-[18px] border border-line bg-white p-5 md:p-6" aria-labelledby="live-h">
      <div className="flex items-center justify-between gap-3">
        <h2 id="live-h" className="flex items-center gap-2 text-[16px] font-bold text-forest">
          <span className="relative flex size-2.5" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sprout opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2.5 rounded-full bg-sprout" />
          </span>
          On the website now
        </h2>
        {s.data && (
          <span className="text-[12.5px] text-muted">
            Updated {new Date(s.data.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" })}
          </span>
        )}
      </div>
      {s.loading ? (
        <div className="mt-4 grid gap-2" aria-busy>
          <div className="h-9 w-20 animate-pulse rounded-lg bg-mint" />
          <div className="h-4 w-48 animate-pulse rounded bg-mint" />
        </div>
      ) : s.error && !s.data ? (
        <p role="alert" className="mt-3 text-[14.5px] text-[#8a1c14]">
          {s.error}
        </p>
      ) : s.data ? (
        <div className="mt-3 grid gap-4 md:grid-cols-[auto_1fr] md:items-start md:gap-8">
          <div>
            <p className="text-[40px] leading-none font-bold text-ink tabular-nums" data-testid="live-users">
              {s.data.users.toLocaleString("en-GB")}
            </p>
            <p className="mt-1 text-[13.5px] text-muted">{s.data.users === 1 ? "person" : "people"} in the last 30 minutes</p>
          </div>
          {s.data.pages.length > 0 ? (
            <ul className="grid gap-1.5 text-[14px]">
              {s.data.pages.map((p) => (
                <li key={p.label} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-ink-soft">{p.label}</span>
                  <span className="shrink-0 font-semibold text-ink tabular-nums">{p.values[0]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-muted">Nobody is reading a page right now.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
