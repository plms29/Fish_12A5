import { CommentThread, type CommentData } from "@/components/comment-box";
import { createPublicClient } from "@/lib/supabase/public";

export async function Comments({ entryId, slug }: { entryId: string; slug: string }) {
  // Lỗi (vd. bảng chưa tạo) thì coi như chưa có bình luận, không làm hỏng trang bài.
  const { data } = await createPublicClient()
    .from("comments")
    .select("id, author_name, body, created_at, edited_at")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });
  const comments = (data ?? []) as CommentData[];

  return (
    <section className="mt-16" aria-labelledby="binh-luan">
      <h2 id="binh-luan" className="font-display text-2xl font-extrabold">
        Bình luận ({comments.length})
      </h2>
      <CommentThread entryId={entryId} slug={slug} comments={comments} />
    </section>
  );
}
