import { CommentBox } from "@/components/comment-box";
import { createPublicClient } from "@/lib/supabase/public";

type Comment = { id: string; author_name: string; body: string; created_at: string };

export async function Comments({ entryId, slug }: { entryId: string; slug: string }) {
  // Lỗi (vd. bảng chưa tạo) thì coi như chưa có bình luận, không làm hỏng trang bài.
  const { data } = await createPublicClient()
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });
  const comments = (data ?? []) as Comment[];

  return (
    <section className="mt-16" aria-labelledby="binh-luan">
      <h2 id="binh-luan" className="font-display text-2xl font-extrabold">
        Bình luận ({comments.length})
      </h2>
      <ul className="mt-5 flex flex-col gap-3">
        {comments.map((c) => (
          <li key={c.id} className="sticker-sm bg-card p-4">
            <p className="text-sm font-bold">
              {c.author_name}{" "}
              <time className="ml-1 font-mono text-xs font-normal text-muted" dateTime={c.created_at}>
                {new Date(c.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
              </time>
            </p>
            <p className="mt-1.5 break-words whitespace-pre-wrap">{c.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <CommentBox entryId={entryId} slug={slug} />
      </div>
    </section>
  );
}
