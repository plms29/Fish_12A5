import Link from "next/link";
import { createSessionClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

type Row = {
  id: string;
  slug: string;
  title: string;
  entry_date: string;
  status: "draft" | "published";
  author_name: string;
  updated_at: string;
};

export default async function StudioHome() {
  const supabase = await createSessionClient();
  const { data } = await supabase
    .from("entries")
    .select("id, slug, title, entry_date, status, author_name, updated_at")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];
  const drafts = rows.filter((r) => r.status === "draft").length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Bài viết</h1>
          <p className="mt-1 text-ink-soft">
            {rows.length} bài · {drafts} bản nháp
          </p>
        </div>
        <Link href="/viet/moi" className="sticker press bg-grass px-5 py-2.5 font-bold text-white">
          + Trang nhật ký mới
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="sticker mt-8 p-8 text-center text-ink-soft">
          Chưa có bài nào. Bấm <strong className="text-ink">Trang nhật ký mới</strong> để viết trang đầu tiên.
        </div>
      ) : (
        <ul className="sticker mt-8 divide-y-2 divide-ink/10 overflow-hidden">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 hover:bg-mint-soft">
              <span className="w-24 font-mono text-xs font-bold">{formatDate(r.entry_date)}</span>
              <Link href={`/viet/bai/${r.id}`} className="min-w-0 flex-1 truncate font-semibold hover:underline">
                {r.title}
              </Link>
              <span className="text-xs text-muted">{r.author_name}</span>
              {r.status === "published" ? (
                <Link
                  href={`/nhat-ky/${r.slug}`}
                  className="rounded-md border-[1.5px] border-ink bg-mint px-2 py-0.5 font-mono text-[11px] font-bold uppercase"
                >
                  Đã đăng ↗
                </Link>
              ) : (
                <span className="rounded-md border-[1.5px] border-ink bg-sun px-2 py-0.5 font-mono text-[11px] font-bold uppercase">
                  Nháp
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
