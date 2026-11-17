import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { DeleteEnquiry, EnquiryManage, MarkReplied, NoteForm } from "@/components/admin/EnquiryControls";
import { requireStaff } from "@/server/admin/auth";
import { answerRows, getEnquiry, handlers, replySubject, STATUS_LABEL, STATUS_STYLE, STATUSES } from "@/server/admin/enquiries";
import { can } from "@/server/admin/roles";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Enquiry" };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

export default async function EnquiryPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  const staff = await requireStaff("enquiries.view");
  const { id } = await params;
  const found = await getEnquiry(staff, id);
  if (!found) notFound();
  const { enquiry: e, notes } = found;
  const manage = can(staff.role, "enquiries.manage");
  const people = manage ? await handlers() : [];
  const assignee = people.find((p) => p.id === e.assigned_to)?.name;
  const phone = typeof e.payload.phone === "string" && e.payload.phone ? e.payload.phone : null;
  const mailto = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent(replySubject(e))}&body=${encodeURIComponent(`Hi ${e.name.split(" ")[0]},\n\n`)}`;

  return (
    <div className="grid gap-6">
      <Link href="/admin/enquiries" className="text-[14.5px] font-semibold text-leaf hover:text-forest">
        ← Enquiries
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] leading-tight font-semibold text-forest md:text-[34px]">{e.name}</h1>
          <p className="mt-1 text-[15px] text-ink-soft">
            {e.kind === "academy" ? "Academy interest" : "Discovery enquiry"} · {when(e.created_at)}
            {assignee ? ` · handled by ${assignee}` : ""}
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-[13px] font-semibold", STATUS_STYLE[e.status])}>{STATUS_LABEL[e.status]}</span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid content-start gap-6">
          <section className="rounded-[18px] border border-line bg-white p-5 md:p-6">
            <h2 className="mb-3 text-[16px] font-bold text-forest">What they sent</h2>
            <dl className="grid gap-3">
              {answerRows(e).map(([k, v]) => (
                <div key={k} className="grid gap-0.5 sm:grid-cols-[200px_1fr] sm:gap-4">
                  <dt className="text-[13.5px] text-muted">{k}</dt>
                  <dd className="text-[15px] break-words whitespace-pre-wrap text-ink">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[18px] border border-line bg-white p-5 md:p-6">
            <h2 className="mb-3 text-[16px] font-bold text-forest">Team notes</h2>
            {notes.length === 0 ? (
              <p className="mb-4 text-[14.5px] text-muted">No notes yet.</p>
            ) : (
              <ul className="mb-5 grid gap-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-[12px] bg-[#f7faf8] px-4 py-3">
                    <p className="text-[13px] text-muted">
                      <strong className="font-semibold text-ink">{n.author_name}</strong> · {when(n.at)}
                    </p>
                    <p className="mt-1 text-[15px] whitespace-pre-wrap text-ink">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
            {manage && <NoteForm id={e.id} />}
          </section>
        </div>

        <aside className="grid content-start gap-5">
          <section className="grid gap-3 rounded-[18px] border border-line bg-white p-5">
            <h2 className="text-[16px] font-bold text-forest">Reply</h2>
            <a
              href={mailto}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-sprout px-5 text-[15px] font-semibold text-on-sprout hover:bg-sprout-bright"
            >
              <Mail aria-hidden className="size-4" /> Reply by email
            </a>
            <p className="text-[13px] break-all text-muted">Opens your email app, addressed to {e.email}.</p>
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-leaf hover:text-forest">
                <Phone aria-hidden className="size-4" /> {phone}
              </a>
            )}
            {manage && e.status === "new" && <MarkReplied id={e.id} />}
          </section>

          {manage && (
            <section className="rounded-[18px] border border-line bg-white p-5">
              <EnquiryManage
                id={e.id}
                status={e.status}
                statuses={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                assignee={e.assigned_to}
                handlers={people}
              />
            </section>
          )}

          {can(staff.role, "enquiries.delete") && (
            <section className="grid gap-2 rounded-[18px] border border-line bg-white p-5">
              <h2 className="text-[16px] font-bold text-forest">Delete</h2>
              <p className="text-[13.5px] text-muted">For spam, or when someone asks for their details to be removed.</p>
              <DeleteEnquiry id={e.id} name={e.name} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
