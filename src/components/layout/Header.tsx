"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = useMemo(() => NAV_LINKS, []);

  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-[color:var(--background)]/94 backdrop-blur">
      <div className="container-shell flex h-22 items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-4" onClick={() => setMenuOpen(false)}>
          <Image
            src="/wial-logo.png"
            alt="WIAL logo"
            width={120}
            height={54}
            className="h-11 w-auto"
            priority
          />
          <div className="hidden sm:block">
            <div className="text-[0.74rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
              World Institute for Action Learning
            </div>
            <div className="text-sm font-semibold tracking-tight">Global Network</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]",
                  active && "text-[color:var(--foreground)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/access?redirect=/admin"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:border-black/20"
          >
            Workspace sign-in
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-black/6 bg-[color:var(--background)] md:hidden">
          <div className="container-shell flex flex-col gap-2 py-4">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium",
                    active ? "bg-white text-black" : "text-[color:var(--muted-foreground)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/access?redirect=/admin"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black"
            >
              Workspace sign-in
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
