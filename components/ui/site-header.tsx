"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ButtonLink, Container, SmartLink, cx } from "./primitives";

export type NavLink = { label: string; href: string };
export type NavAction = NavLink & { variant?: "primary" | "secondary" | "glow" };

/**
 * Responsive site header: brand left, navigation centre, actions right.
 * On small screens the nav collapses into an accessible disclosure menu
 * (button with aria-expanded/aria-controls, closes on Escape and on navigate).
 */
export function SiteHeader({
  brand,
  links,
  actions,
  navLabel = "Primary",
}: {
  brand: ReactNode;
  links: NavLink[];
  actions: NavAction[];
  navLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open]);

  const linkClass =
    "relative py-1 text-sm text-gray-300 transition-colors duration-300 hover:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <header data-tone="inverted" className="sticky top-0 z-50 border-b border-line bg-ink/80 text-white backdrop-blur-xl">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>
      <Container className="grid h-16 grid-cols-[1fr_auto] items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center">{brand}</div>

        <nav aria-label={navLabel} className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <SmartLink key={l.label} href={l.href} className={linkClass}>
              {l.label}
            </SmartLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <div className="hidden items-center gap-3 lg:flex">
            {actions.map((a) => (
              <ButtonLink
                key={a.label}
                href={a.href}
                variant={a.variant ?? "secondary"}
                arrow={false}
                className="h-9 px-4"
              >
                {a.label}
              </ButtonLink>
            ))}
          </div>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex size-10 items-center justify-center border border-line lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
          </button>
        </div>
      </Container>

      <div
        id={menuId}
        hidden={!open}
        className={cx("border-t border-line bg-ink lg:hidden")}
      >
        <Container className="flex flex-col gap-1 py-4">
          <nav aria-label={`${navLabel} (mobile)`} className="flex flex-col">
            {links.map((l) => (
              <SmartLink
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 text-lg tracking-[-0.02em]"
              >
                {l.label}
              </SmartLink>
            ))}
          </nav>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {actions.map((a) => (
              <ButtonLink
                key={a.label}
                href={a.href}
                variant={a.variant ?? "secondary"}
                onClick={() => setOpen(false)}
              >
                {a.label}
              </ButtonLink>
            ))}
          </div>
        </Container>
      </div>
    </header>
  );
}
