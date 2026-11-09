"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTHOR_COOKIE, SHARED_EDITOR_EMAIL } from "@/lib/auth-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: string } | undefined;

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lấy (hoặc tạo lần đầu) tài khoản biên tập dùng chung của lớp. */
async function ensureSharedEditor(admin: ReturnType<typeof createAdminClient>) {
  const { data: existing } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "shared_editor_id")
    .maybeSingle();
  if (existing?.value) return existing.value;

  const { data, error } = await admin.auth.admin.createUser({
    email: SHARED_EDITOR_EMAIL,
    email_confirm: true,
    password: crypto.randomUUID() + crypto.randomUUID(),
  });
  if (error || !data.user) throw new Error("Không tạo được tài khoản viết chung");
  await admin.from("profiles").upsert({ id: data.user.id, display_name: "Lớp 12A5", is_editor: true });
  await admin.from("app_settings").upsert({ key: "shared_editor_id", value: data.user.id });
  return data.user.id;
}

/** Vào Góc viết chỉ bằng tên + mã truy cập của lớp. */
export async function enterWithCode(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const code = str(fd, "code");
  if (!name || name.length > 60) return { error: "Nhập tên của bạn (tối đa 60 ký tự)." };
  if (!code) return { error: "Nhập mã truy cập." };

  const admin = createAdminClient();
  const { data: setting } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "invite_code")
    .maybeSingle();
  if (!setting || setting.value !== code) {
    await sleep(800); // làm chậm việc đoán mã
    return { error: "Mã truy cập chưa đúng." };
  }

  await ensureSharedEditor(admin);

  // Tạo phiên đăng nhập trực tiếp, không gửi email nào.
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: SHARED_EDITOR_EMAIL,
  });
  if (linkErr || !link.properties?.hashed_token) return { error: "Không đăng nhập được, thử lại sau." };

  const supabase = await createSessionClient();
  const { error: otpErr } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  if (otpErr) return { error: "Không đăng nhập được, thử lại sau." };

  (await cookies()).set(AUTHOR_COOKIE, encodeURIComponent(name), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/viet");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut({ scope: "local" });
  (await cookies()).delete(AUTHOR_COOKIE);
  redirect("/");
}
