"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/auth-actions";
import { getViewer } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

function readBody(fd: FormData) {
  const body = String(fd.get("body") ?? "").trim();
  return body && body.length <= 1000 ? body : null;
}

/** Tên người đang đăng nhập (null nếu chưa), để trang cache biết ai được sửa/xoá. */
export async function whoAmI() {
  return (await getViewer())?.displayName ?? null;
}

export async function addComment(entryId: string, slug: string, _: FormState, fd: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Hãy đăng nhập để bình luận." };
  if (fd.get("website")) return { ok: "Đã gửi bình luận." }; // ô bẫy bot: người thật không thấy
  const body = readBody(fd);
  if (!body) return { error: "Bình luận cần từ 1 đến 1000 ký tự." };

  const { error } = await (await createSessionClient()).from("comments").insert({
    entry_id: entryId,
    author_id: viewer.id,
    author_name: viewer.displayName,
    body,
  });
  if (error) {
    if (error.message.includes("rate_limit")) return { error: "Bạn gửi hơi nhanh, đợi một chút rồi thử lại nhé." };
    if (error.message.includes("duplicate")) return { error: "Bạn vừa gửi đúng nội dung này rồi." };
    return { error: "Không gửi được bình luận, thử lại sau." };
  }
  revalidatePath(`/nhat-ky/${slug}`);
  return { ok: "Đã gửi bình luận." };
}

// Cả lớp dùng chung một tài khoản nên "của mình" = đúng tên đã nhập lúc đăng nhập.
export async function editComment(id: string, slug: string, _: FormState, fd: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Hãy đăng nhập lại." };
  const body = readBody(fd);
  if (!body) return { error: "Bình luận cần từ 1 đến 1000 ký tự." };
  const { data, error } = await (await createSessionClient())
    .from("comments")
    .update({ body })
    .eq("id", id)
    .eq("author_name", viewer.displayName)
    .select("id");
  if (error || !data?.length) return { error: "Không sửa được bình luận này." };
  revalidatePath(`/nhat-ky/${slug}`);
  return { ok: "Đã lưu." };
}

export async function deleteComment(id: string, slug: string) {
  const viewer = await getViewer();
  if (!viewer) return;
  await (await createSessionClient()).from("comments").delete().eq("id", id).eq("author_name", viewer.displayName);
  revalidatePath(`/nhat-ky/${slug}`);
}
