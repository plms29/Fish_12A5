import type { Metadata } from "next";
import { logout } from "@/app/auth-actions";
import { requireEditor } from "@/lib/auth";
import { StudioNav } from "./studio-nav";

export const metadata: Metadata = { title: "Góc viết", robots: { index: false } };

export default async function StudioLayout({ children }: LayoutProps<"/viet">) {
  const viewer = await requireEditor();
  return (
    <div className="min-h-[70dvh] bg-paper-2/60">
      <div className="border-b-2 border-ink bg-mint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <span className="font-mono text-xs font-bold tracking-[0.18em] uppercase">Góc viết</span>
          <StudioNav />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="font-semibold">{viewer.displayName}</span>
            <form action={logout}>
              <button type="submit" className="sticker-sm bg-card px-2.5 py-1 text-xs font-bold hover:bg-paper">
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
