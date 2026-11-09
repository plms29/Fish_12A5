"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { AUTHOR_COOKIE } from "@/lib/auth-config";
import { requireEditor } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import type { FormState } from "@/app/auth-actions";

/** Làm mới các trang công khai sau khi viết/sửa/xoá. */
export async function revalidateSite() {
  await requireEditor();
  revalidatePath("/", "layout");
}

export async function updateInviteCode(_: FormState, fd: FormData): Promise<FormState> {
  await requireEditor();
  const code = String(fd.get("invite") ?? "").trim();
  if (code.length < 6) return { error: "Mã truy cập cần ít nhất 6 ký tự." };
  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ value: code, updated_at: new Date().toISOString() })
    .eq("key", "invite_code");
  if (error) return { error: "Không lưu được mã truy cập." };
  return { ok: "Đã đổi mã. Từ giờ phải nhập mã mới để vào Góc viết." };
}

export async function updateDisplayName(_: FormState, fd: FormData): Promise<FormState> {
  await requireEditor();
  const name = String(fd.get("name") ?? "").trim();
  if (!name || name.length > 60) return { error: "Tên cần từ 1 đến 60 ký tự." };
  (await cookies()).set(AUTHOR_COOKIE, encodeURIComponent(name), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/viet", "layout");
  return { ok: "Đã đổi tên người viết." };
}
