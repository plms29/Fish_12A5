"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/auth-actions";
import { getViewer } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export async function addComment(entryId: string, slug: string, _: FormState, fd: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Hãy đăng nhập để bình luận." };
  const body = String(fd.get("body") ?? "").trim();
  if (!body || body.length > 1000) return { error: "Bình luận cần từ 1 đến 1000 ký tự." };

  const { error } = await (await createSessionClient()).from("comments").insert({
    entry_id: entryId,
    author_id: viewer.id,
    author_name: viewer.displayName,
    body,
  });
  if (error) return { error: "Không gửi được bình luận, thử lại sau." };
  revalidatePath(`/nhat-ky/${slug}`);
  return { ok: "Đã gửi bình luận." };
}
