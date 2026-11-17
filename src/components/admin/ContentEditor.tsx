"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { editorAction, type ContentState } from "@/server/admin/actions/content-actions";
import { MarkdownEditor } from "./MarkdownEditor";
import { Notice, SubmitButton } from "./ui";

type Kind = "article" | "case_study";
type Result = { label: string; value: string };

export type EditorProps = {
  kind: Kind;
  draftId?: string;
  slug?: string | null;
  baseSha?: string | null;
  title: string;
  data: Record<string, unknown>;
  body: string;
  canPublish: boolean;
  canSubmit: boolean;
  isLive: boolean;
  tagSuggestions?: string[];
  serviceOptions?: { id: string; label: string }[];
  video?: { src: string; duration?: string } | null;
};

const inputCls =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink hover:border-forest/40 focus:border-forest focus:shadow-[0_0_0_3px_rgb(45_189_50/0.25)] focus:outline-none";
const labelCls = "text-[14.5px] font-medium text-ink";

function asList(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

export function ContentEditor(p: EditorProps) {
  const isArticle = p.kind === "article";
  const [title, setTitle] = useState(p.title);
  const [body, setBody] = useState(p.body);
  const [summary, setSummary] = useState(String(p.data.summary ?? ""));
  // article
  const [tags, setTags] = useState(asList(p.data.tags).join(", "));
  const [date, setDate] = useState(String(p.data.date ?? new Date().toISOString().slice(0, 10)));
  const [byline, setByline] = useState(String(p.data.author ?? "TechieBreed team"));
  // case study
  const [client, setClient] = useState(String(p.data.client ?? ""));
  const [industry, setIndustry] = useState(String(p.data.industry ?? ""));
  const [svc, setSvc] = useState<string[]>(asList(p.data.services));
  const [order, setOrder] = useState(p.data.order === undefined ? "" : String(p.data.order));
  const [flow, setFlow] = useState(asList(p.data.flow).join("\n"));
  const [results, setResults] = useState<Result[]>(Array.isArray(p.data.results) ? (p.data.results as Result[]) : []);

  const [savedPayload, setSavedPayload] = useState<string | null>(null);
  const [state, action] = useActionState(async (prev: ContentState, form: FormData) => {
    const r = await editorAction(prev, form);
    if (r.ok) setSavedPayload(String(form.get("payload")));
    return r;
  }, {} as ContentState);
  const draftId = state.draftId ?? p.draftId;

  const data = useMemo(() => {
    if (isArticle) {
      return {
        summary,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        date,
        author: byline,
      };
    }
    return {
      client,
      industry,
      summary,
      services: svc,
      order: order === "" ? undefined : Number(order),
      flow: flow.split("\n").map((l) => l.trim()).filter(Boolean),
      results: results.filter((r) => r.label.trim() || r.value.trim()),
    };
  }, [isArticle, summary, tags, date, byline, client, industry, svc, order, flow, results]);

  const payload = JSON.stringify({ id: draftId, kind: p.kind, slug: p.slug ?? null, baseSha: p.baseSha ?? null, title, data, body });

  // Warn before leaving with unsaved changes.
  const [initialPayload] = useState(payload);
  const dirty = payload !== (savedPayload ?? initialPayload);
  useEffect(() => {
    if (!dirty) return;
    const onBefore = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [dirty]);

  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="payload" value={payload} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ed-title" className={labelCls}>
              Title
            </label>
            <input id="ed-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} className={`${inputCls} text-[18px] font-semibold`} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ed-summary" className={labelCls}>
              Summary <span className="font-normal text-muted">— shown on cards, in Google and when shared ({summary.length}/{isArticle ? 300 : 400})</span>
            </label>
            <textarea id="ed-summary" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={isArticle ? 300 : 400} rows={2} className={inputCls} />
          </div>
          <MarkdownEditor
            value={body}
            onChange={setBody}
            label={isArticle ? "Article" : "Case study text"}
            inserts={
              isArticle
                ? []
                : [
                    { label: "Flow diagram", text: "\n## How the system works\n\n<FlowDiagram />\n" },
                    { label: "Results", text: "\n## Results\n\n<Results />\n" },
                  ]
            }
          />
        </div>

        <aside className="grid content-start gap-5 rounded-[16px] border border-line bg-white p-5">
          {isArticle ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ed-tags" className={labelCls}>
                  Topics
                </label>
                <input id="ed-tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="Automation, Small business" />
                {p.tagSuggestions && p.tagSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.tagSuggestions.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          const list = tags.split(",").map((x) => x.trim()).filter(Boolean);
                          if (!list.includes(t)) setTags([...list, t].join(", "));
                        }}
                        className="rounded-full bg-mint px-2.5 py-1 text-[12.5px] font-semibold text-forest hover:bg-sage"
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ed-date" className={labelCls}>
                  Date
                </label>
                <input id="ed-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ed-byline" className={labelCls}>
                  Byline
                </label>
                <input id="ed-byline" value={byline} onChange={(e) => setByline(e.target.value)} maxLength={80} className={inputCls} />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ed-client" className={labelCls}>
                  Client
                </label>
                <input id="ed-client" value={client} onChange={(e) => setClient(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ed-industry" className={labelCls}>
                  Industry
                </label>
                <input id="ed-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls} placeholder="Real estate & property" />
              </div>
              <fieldset>
                <legend className={`${labelCls} mb-1.5`}>Services shown</legend>
                <div className="flex flex-wrap gap-1.5">
                  {(p.serviceOptions ?? []).map((o) => {
                    const on = svc.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSvc(on ? svc.filter((x) => x !== o.id) : [...svc, o.id])}
                        className={on ? "rounded-full bg-forest px-2.5 py-1 text-[12.5px] font-semibold text-white" : "rounded-full bg-mint px-2.5 py-1 text-[12.5px] font-semibold text-forest hover:bg-sage"}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ed-order" className={labelCls}>
                  Position on Our Work
                </label>
                <input id="ed-order" type="number" min={1} max={99} value={order} onChange={(e) => setOrder(e.target.value)} className={inputCls} placeholder="1 = first" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ed-flow" className={labelCls}>
                  Flow steps <span className="font-normal text-muted">— one per line</span>
                </label>
                <textarea id="ed-flow" value={flow} onChange={(e) => setFlow(e.target.value)} rows={6} className={inputCls} />
              </div>
              <div className="grid gap-2">
                <span className={labelCls}>Results</span>
                <p className="-mt-1 text-[12.5px] text-muted">Verified figures only. Leave empty to show &ldquo;Results being measured&rdquo;.</p>
                {results.map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_auto] gap-1.5">
                    <input aria-label="What was measured" value={r.label} onChange={(e) => setResults(results.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={`${inputCls} py-2 text-[14px]`} placeholder="Hours saved a week" />
                    <input aria-label="Figure" value={r.value} onChange={(e) => setResults(results.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className={`${inputCls} py-2 text-[14px]`} placeholder="12" />
                    <button type="button" onClick={() => setResults(results.filter((_, j) => j !== i))} className="grid size-9 place-items-center rounded-md text-muted hover:bg-blush hover:text-[#b42318]">
                      <Trash2 aria-hidden className="size-4" />
                      <span className="sr-only">Remove result</span>
                    </button>
                  </div>
                ))}
                {results.length < 6 && (
                  <button type="button" onClick={() => setResults([...results, { label: "", value: "" }])} className="inline-flex w-fit items-center gap-1 text-[13.5px] font-semibold text-leaf hover:text-forest">
                    <Plus aria-hidden className="size-4" /> Add a result
                  </button>
                )}
              </div>
              {p.video && (
                <p className="rounded-[10px] bg-mint px-3 py-2 text-[13px] text-pine">
                  Video: {p.video.src.split("/").pop()} {p.video.duration ? `(${p.video.duration})` : ""} — kept as it is.
                </p>
              )}
            </>
          )}
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 grid gap-3 border-t border-line bg-[#f3f6f4]/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton name="intent" value="save" variant="secondary" pendingLabel="Saving…">
            Save draft
          </SubmitButton>
          {p.canSubmit && (
            <SubmitButton name="intent" value="submit" variant="dark" pendingLabel="Submitting…">
              Submit for review
            </SubmitButton>
          )}
          {p.canPublish && (
            <SubmitButton name="intent" value="publish" pendingLabel="Publishing…">
              {p.isLive ? "Publish changes" : "Publish"}
            </SubmitButton>
          )}
          {p.canPublish && state.stale && (
            <SubmitButton name="intent" value="publish_force" variant="danger" pendingLabel="Publishing…">
              Publish anyway (replace the live version)
            </SubmitButton>
          )}
          <span className="text-[13px] text-muted">{dirty ? "Unsaved changes" : draftId ? "All changes saved as a draft" : ""}</span>
        </div>
      </div>
    </form>
  );
}
