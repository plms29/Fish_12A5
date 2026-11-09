"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Nhật ký" },
  { href: "/giai-doan", label: "Giai đoạn" },
  { href: "/thu-vien", label: "Thư viện" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/nhat-ky");
  return pathname.startsWith(href);
}

export function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(pathname, l.href) ? "page" : undefined}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-paper-2 aria-[current=page]:bg-mint aria-[current=page]:text-ink"
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/viet"
          className="sticker-sm press ml-3 bg-ink px-3.5 py-1.5 text-sm font-bold text-paper hover:bg-ink"
        >
          Viết nhật ký
        </Link>
      </nav>

      <button
        type="button"
        className="sticker-sm ml-auto bg-card px-3 py-1.5 text-sm font-bold md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Đóng" : "Menu"}
      </button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-16 border-b-2 border-ink bg-paper px-4 py-3 md:hidden"
          aria-label="Điều hướng chính"
        >
          <ul className="flex flex-col gap-1">
            {[...LINKS, { href: "/viet", label: "Viết nhật ký" }].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  className="block rounded-lg px-3 py-2.5 font-semibold aria-[current=page]:bg-mint"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
