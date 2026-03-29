import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-black/8 bg-white">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Image src="/wial-logo.png" alt="WIAL logo" width={124} height={55} className="h-11 w-auto" />
            <div>
              <p className="text-sm font-semibold tracking-tight">WIAL Global Network</p>
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                Governed chapters and multilingual discovery
              </p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            WIAL connects local chapter presence with global consistency: coach discovery,
            certification information, events, resources, and chapter-level contact in one calm,
            professional public platform.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
            Explore
          </h2>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[color:var(--foreground)] hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
            Contact
          </h2>
          <div className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
            <p>For global enquiries, contact WIAL Global. Chapter pages provide local contact paths where available.</p>
            <p>
              <a href="mailto:global@wial.org" className="font-medium text-[color:var(--foreground)]">
                global@wial.org
              </a>
            </p>
            <p>Copyright © 2026 WIAL</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
