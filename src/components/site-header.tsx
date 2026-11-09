import Link from "next/link";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="Bể cá 12A5 — trang chủ">
          <img
            src="/logo-256.webp"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border-2 border-ink transition-transform group-hover:-rotate-6"
          />
          <span className="leading-none">
            <span className="block font-display text-lg font-extrabold tracking-tight">Bể cá 12A5</span>
            <span className="block font-mono text-[10px] font-bold tracking-[0.18em] text-muted uppercase">
              asymptotic · a5k41
            </span>
          </span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
