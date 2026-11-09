import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTHOR_COOKIE } from "./auth-config";
import { createSessionClient } from "./supabase/server";

export type Viewer = {
  id: string;
  /** Tên người đang viết, nhập lúc vào Góc viết. */
  displayName: string;
  isEditor: boolean;
};

export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_editor")
    .eq("id", user.id)
    .maybeSingle();
  const raw = (await cookies()).get(AUTHOR_COOKIE)?.value;
  let name = "";
  try {
    name = raw ? decodeURIComponent(raw) : "";
  } catch {
    name = "";
  }
  return {
    id: user.id,
    displayName: name || profile?.display_name || "Lớp 12A5",
    isEditor: profile?.is_editor ?? false,
  };
}

/** Dùng ở đầu mọi trang /viet. */
export async function requireEditor() {
  const viewer = await getViewer();
  if (!viewer) redirect("/dang-nhap");
  if (!viewer.isEditor) redirect("/dang-nhap?loi=khong-co-quyen");
  return viewer;
}
