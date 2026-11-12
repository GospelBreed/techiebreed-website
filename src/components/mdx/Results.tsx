import { Hourglass } from "lucide-react";

/**
 * Results for a case study. Only verified figures from the MDX frontmatter are shown;
 * with none, the section says results are still being measured.
 */
export function Results({ results }: { results: { label: string; value: string }[] }) {
  if (!results.length) {
    return (
      <div className="my-6 flex flex-col items-start gap-4 rounded-[20px] border border-dashed border-forest/30 bg-mint/60 p-6 sm:flex-row sm:items-center">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-forest">
          <Hourglass aria-hidden className="size-6" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-[18px] font-bold text-forest">Results being measured</p>
          <p className="mt-1 text-[15px] leading-[1.55] text-ink-soft">
            We only publish figures once they have been measured and verified. This section will be updated.
          </p>
        </div>
      </div>
    );
  }
  return (
    <dl className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((r) => (
        <div key={r.label} className="rounded-[20px] bg-sage p-6">
          <dt className="text-[15px] leading-[1.4] text-pine">{r.label}</dt>
          <dd className="mt-2 font-display text-[36px] leading-none font-semibold text-forest">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
