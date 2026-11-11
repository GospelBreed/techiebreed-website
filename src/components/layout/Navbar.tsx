"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { auditCta, mainNav } from "@/lib/site";
import { services } from "@/content-data/services";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const linkBase =
  "relative inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-2 text-[16px] font-medium tracking-[0.02em] text-white " +
  "after:absolute after:bottom-0.5 after:left-2.5 after:h-0.5 after:w-0 after:bg-lime after:transition-[width] after:duration-300 after:ease-out-soft " +
  "hover:after:w-[calc(100%-1.25rem)]";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile drawer
  const [servicesOpen, setServicesOpen] = useState(false); // desktop dropdown
  const dropdownRef = useRef<HTMLLIElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll and listen for Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the drawer when the page width reaches desktop size.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Close the desktop dropdown on outside click or Escape.
  useEffect(() => {
    if (!servicesOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setServicesOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen]);

  // Transient menus should never be open when this view is hidden and restored.
  useLayoutEffect(
    () => () => {
      setOpen(false);
      setServicesOpen(false);
    },
    [],
  );

  const closeAll = () => {
    setOpen(false);
    setServicesOpen(false);
  };

  return (
    <header
      className={cn(
        "on-dark sticky top-0 z-50 bg-forest transition-shadow duration-300",
        scrolled && "shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)]",
      )}
    >
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-white px-4 py-2 font-medium text-forest focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <div className="container-x flex h-[72px] items-center justify-between gap-6 xl:h-[78px]">
        <Link href="/" aria-label="TechieBreed home" onNavigate={closeAll} className="rounded-md">
          <Logo tone="light" />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center">
            {mainNav.map((item) =>
              item.href === "/what-we-do" ? (
                <li
                  key={item.href}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onNavigate={closeAll}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className={cn(linkBase, "pr-1 aria-[current=page]:after:w-[calc(100%-1rem)]")}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={servicesOpen}
                      aria-controls="services-menu"
                      aria-label="Show services"
                      onClick={() => setServicesOpen((v) => !v)}
                      className="mr-1 grid size-7 place-items-center rounded-md text-white"
                    >
                      <ChevronDown
                        aria-hidden
                        className={cn("size-4 transition-transform duration-300", servicesOpen && "rotate-180")}
                      />
                    </button>
                  </div>
                  <div
                    id="services-menu"
                    className={cn(
                      "absolute top-full left-0 pt-3 transition-[opacity,translate] duration-300 ease-out-soft",
                      servicesOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                    )}
                  >
                    <ul className="w-[340px] overflow-hidden rounded-[12px] bg-white p-2 shadow-float ring-1 ring-black/5">
                      {services.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={`/what-we-do#${s.id}`}
                            onNavigate={closeAll}
                            className="block rounded-[8px] px-4 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-mint-wash hover:text-moss focus-visible:bg-mint-wash"
                          >
                            {s.title}
                          </Link>
                        </li>
                      ))}
                      <li className="mt-1 border-t border-line pt-1">
                        <Link
                          href="/what-we-do#packages"
                          onNavigate={closeAll}
                          className="block rounded-[8px] px-4 py-3 text-[15px] font-semibold text-leaf transition-colors hover:bg-mint-wash hover:text-moss"
                        >
                          Ways to work with us
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onNavigate={closeAll}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={cn(linkBase, "aria-[current=page]:after:w-[calc(100%-1.25rem)]")}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={auditCta.href}
            onNavigate={closeAll}
            className="hidden h-12 items-center whitespace-nowrap rounded-[9px] bg-sprout px-5 text-[16px] font-medium text-white transition-[filter] duration-200 ease-in hover:brightness-90 md:inline-flex"
          >
            {auditCta.label}
          </Link>

          {/* Mobile menu toggle */}
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative grid size-11 place-items-center rounded-md xl:hidden"
          >
            <span aria-hidden className="relative block h-4 w-6">
              <span
                className={cn(
                  "absolute left-0 h-0.5 w-6 rounded bg-white transition-all duration-300 ease-drawer",
                  open ? "top-[7px] rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute top-[7px] right-0 h-0.5 rounded bg-white transition-all duration-300 ease-drawer",
                  open ? "w-0 opacity-0" : "w-4",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 h-0.5 w-6 rounded bg-white transition-all duration-300 ease-drawer",
                  open ? "top-[7px] -rotate-45" : "top-[14px]",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer: slides open from the left */}
      <div
        id="mobile-menu"
        inert={!open}
        className={cn(
          "fixed top-[72px] bottom-0 left-0 z-40 overflow-hidden bg-black transition-[width] duration-[400ms] ease-drawer xl:hidden",
          open ? "w-full" : "w-0",
        )}
      >
        <nav aria-label="Mobile" className="flex h-full w-screen flex-col overflow-y-auto px-4 pt-4 pb-10">
          <ul className="flex flex-col">
            <li>
              <Link
                href="/"
                onNavigate={closeAll}
                aria-current={pathname === "/" ? "page" : undefined}
                className="block px-4 py-3.5 text-[20px] font-medium tracking-[0.03em] text-white transition-colors hover:text-sprout aria-[current=page]:text-lime"
              >
                Home
              </Link>
            </li>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onNavigate={closeAll}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="block px-4 py-3.5 text-[20px] font-medium tracking-[0.03em] text-white transition-colors hover:text-sprout aria-[current=page]:text-lime"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={auditCta.href}
            onNavigate={closeAll}
            className="mx-4 mt-6 inline-flex h-[50px] items-center justify-center rounded-[9px] bg-sprout px-5 text-[16px] font-medium text-white transition-[filter] hover:brightness-90"
          >
            {auditCta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
