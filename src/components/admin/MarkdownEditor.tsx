"use client";

import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote } from "lucide-react";
import { Marked } from "marked";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Preview renderer: raw HTML shown as text, only safe links, components shown as labelled blocks. */
const md = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html({ text }) {
      const component = text.trim().match(/^<(FlowDiagram|Results)\s*\/>$/);
      if (component) {
        const label = component[1] === "FlowDiagram" ? "How the system works — flow diagram" : "Results (verified figures or “Results being measured”)";
        return `<div class="md-component">${label}</div>`;
      }
      return `<p>${escapeHtml(text)}</p>`;
    },
    link({ href, text }) {
      const safe = /^(https?:\/\/|\/|#|mailto:)/i.test(href) ? href : "#";
      return `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    },
    image({ text }) {
      return `<em>[image: ${escapeHtml(text)}]</em>`;
    },
  },
});

type Tool = { label: string; icon: typeof Bold; apply: (sel: string) => { text: string; select?: [number, number] } };

const TOOLS: Tool[] = [
  { label: "Heading", icon: Heading2, apply: (s) => ({ text: `\n## ${s || "Heading"}\n` }) },
  { label: "Sub-heading", icon: Heading3, apply: (s) => ({ text: `\n### ${s || "Sub-heading"}\n` }) },
  { label: "Bold", icon: Bold, apply: (s) => ({ text: `**${s || "bold text"}**` }) },
  { label: "Italic", icon: Italic, apply: (s) => ({ text: `*${s || "italic text"}*` }) },
  { label: "Link", icon: Link2, apply: (s) => ({ text: `[${s || "link text"}](https://)` }) },
  { label: "Bullet list", icon: List, apply: (s) => ({ text: `\n${(s || "First point\nSecond point").split("\n").map((l) => `- ${l}`).join("\n")}\n` }) },
  { label: "Numbered list", icon: ListOrdered, apply: (s) => ({ text: `\n${(s || "First step\nSecond step").split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n")}\n` }) },
  { label: "Quote", icon: Quote, apply: (s) => ({ text: `\n> ${s || "A short quote"}\n` }) },
];

export function MarkdownEditor({
  value,
  onChange,
  inserts = [],
  label = "Text",
}: {
  value: string;
  onChange: (v: string) => void;
  /** Extra one-click inserts, e.g. case-study components. */
  inserts?: { label: string; text: string }[];
  label?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [view, setView] = useState<"write" | "preview" | "split">("split");
  const html = useMemo(() => md.parse(value || "*Nothing written yet.*") as string, [value]);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  function insert(text: string) {
    const el = ref.current;
    if (!el) return onChange(value + text);
    const { selectionStart: a, selectionEnd: b } = el;
    const next = value.slice(0, a) + text + value.slice(b);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + text.length, a + text.length);
    });
  }

  function applyTool(t: Tool) {
    const el = ref.current;
    const sel = el ? value.slice(el.selectionStart, el.selectionEnd) : "";
    insert(t.apply(sel).text);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span id="md-label" className="text-[14.5px] font-medium text-ink">
          {label}
        </span>
        <div role="tablist" aria-label="Editor view" className="flex rounded-full border border-line bg-white p-0.5 text-[13px] font-semibold">
          {(["write", "split", "preview"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-3 py-1 capitalize",
                view === v ? "bg-forest text-white" : "text-muted hover:text-forest",
                v === "split" && "hidden lg:block",
              )}
            >
              {v === "split" ? "Side by side" : v}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("grid gap-3", view === "split" && "lg:grid-cols-2")}>
        {view !== "preview" && (
          <div className="overflow-hidden rounded-[12px] border border-line bg-white focus-within:border-forest focus-within:shadow-[0_0_0_3px_rgb(45_189_50/0.25)]">
            <div className="flex flex-wrap gap-0.5 border-b border-line bg-[#f7faf8] p-1.5" role="toolbar" aria-label="Formatting">
              {TOOLS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  title={t.label}
                  onClick={() => applyTool(t)}
                  className="grid size-8 place-items-center rounded-md text-ink-soft hover:bg-mint hover:text-forest"
                >
                  <t.icon aria-hidden className="size-4" />
                  <span className="sr-only">{t.label}</span>
                </button>
              ))}
              {inserts.map((x) => (
                <button
                  key={x.label}
                  type="button"
                  onClick={() => insert(x.text)}
                  className="rounded-md px-2 text-[12.5px] font-semibold text-leaf hover:bg-mint hover:text-forest"
                >
                  + {x.label}
                </button>
              ))}
            </div>
            <textarea
              ref={ref}
              aria-labelledby="md-label"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              spellCheck
              className="block min-h-[460px] w-full resize-y border-0 bg-white p-4 font-mono text-[14.5px] leading-[1.7] text-ink focus:outline-none"
              placeholder={"Start writing…\n\n## A heading\n\nA paragraph with **bold** text and a [link](/contact#audit)."}
            />
          </div>
        )}
        {view !== "write" && (
          <div
            className="md-preview min-h-[460px] overflow-auto rounded-[12px] border border-line bg-white p-5"
            aria-label="Preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
      <p className="text-[12.5px] text-muted">
        {words} words · about {Math.max(1, Math.round(words / 200))} min read · Markdown: ## heading, **bold**, - list, [text](link)
      </p>
    </div>
  );
}
