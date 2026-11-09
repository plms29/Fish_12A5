import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function LoginPage({ searchParams }: PageProps<"/dang-nhap">) {
  const { loi } = await searchParams;
  return (
    <AuthShell eyebrow="Dành cho người giữ sổ" title="Nhập mã để viết nhật ký">
      {loi === "khong-co-quyen" && (
        <p className="mb-5 rounded-[10px] border-2 border-ink bg-[#fde3df] px-3.5 py-2.5 text-sm font-semibold">
          Tài khoản này chưa có quyền viết bài.
        </p>
      )}
      <LoginForm />
    </AuthShell>
  );
}
