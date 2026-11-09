"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/viet", label: "Bài viết", exact: true },
  { href: "/viet/giai-doan", label: "Giai đoạn" },
  { href: "/viet/cai-dat", label: "Cài đặt" },
];

export function StudioNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1" aria-label="Góc viết">
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href || pathname.startsWith("/viet/bai") || pathname === "/viet/moi"
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className="rounded-md px-2.5 py-1 text-sm font-semibold hover:bg-card aria-[current=page]:bg-ink aria-[current=page]:text-paper"
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
