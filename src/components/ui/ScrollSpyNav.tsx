"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Sticky row of pill links to sections on the page.
 * The pill for the section currently on screen is highlighted.
 */
export function ScrollSpyNav({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  // Keep the active pill visible on narrow screens.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label={label}
      className="sticky top-[72px] z-30 border-b border-line bg-white/90 backdrop-blur-md xl:top-[78px]"
    >
      <div className="container-x">
        <ul ref={listRef} className="relative -mx-1 flex gap-1.5 overflow-x-auto py-3 [scrollbar-width:none]">
          {items.map((item) => (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                data-id={item.id}
                aria-current={active === item.id ? "location" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-4 font-pill text-[13.5px] font-semibold whitespace-nowrap transition-colors duration-300",
                  active === item.id ? "bg-forest-deep text-white" : "text-[#3d4a40] hover:bg-mint hover:text-forest-deep",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
