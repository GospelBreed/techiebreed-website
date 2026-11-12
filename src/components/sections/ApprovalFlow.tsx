import { ClipboardCheck, FileText, Send, UserCheck } from "lucide-react";
import { cn } from "@/lib/cn";

const steps = [
  { label: "AI prepares", icon: FileText },
  { label: "Your team approves", icon: UserCheck },
  { label: "System sends", icon: Send },
  { label: "Activity recorded", icon: ClipboardCheck },
];

/** The four-step "safe by design" loop, shown as a short vertical flow. */
export function ApprovalFlow({ className }: { className?: string }) {
  return (
    <ol aria-label="How approvals work" className={cn("relative space-y-2.5", className)}>
      <span aria-hidden className="absolute top-4 bottom-4 left-[15px] w-px bg-forest/20" />
      {steps.map(({ label, icon: Icon }, i) => (
        <li key={label} className="relative flex items-center gap-3">
          <span
            className={cn(
              "relative grid size-8 shrink-0 place-items-center rounded-full",
              i === 1 ? "bg-sprout text-on-sprout" : "bg-mint text-forest",
            )}
          >
            <Icon aria-hidden className="size-4" strokeWidth={2} />
          </span>
          <span className={cn("text-[14.5px]", i === 1 ? "font-bold text-forest" : "font-medium text-ink")}>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
