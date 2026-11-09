import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryEditor } from "@/components/editor/entry-editor";
import { requireEditor } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import type { Entry, Phase } from "@/lib/types";

export default async function EditEntryPage({ params, searchParams }: PageProps<"/viet/bai/[id]">) {
  const viewer = await requireEditor();
  const { id } = await params;
  const { "da-luu": saved } = await searchParams;
  const supabase = await createSessionClient();
  const [{ data: entry }, { data: phases }] = await Promise.all([
    supabase.from("entries").select("*").eq("id", id).maybeSingle(),
    supabase.from("phases").select("*").order("sort_order"),
  ]);
  if (!entry) notFound();
  const e = entry as Entry;

  return (
    <>
      {saved && (
        <p role="status" className="mb-6 rounded-[10px] border-2 border-ink bg-mint px-4 py-3 text-sm font-semibold">
          {saved === "published" ? (
            <>
              Đã đăng!{" "}
              <Link href={`/nhat-ky/${e.slug}`} className="underline underline-offset-2">
                Xem trang công khai ↗
              </Link>
            </>
          ) : (
            "Đã lưu bản nháp."
          )}
        </p>
      )}
      <EntryEditor
        key={e.id}
        entry={e}
        phases={(phases ?? []) as Phase[]}
        author={{ id: viewer.id, name: viewer.displayName }}
      />
    </>
  );
}
