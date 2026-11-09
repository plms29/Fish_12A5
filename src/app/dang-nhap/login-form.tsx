"use client";

import { useActionState } from "react";
import { enterWithCode } from "@/app/auth-actions";
import { Field, FormMessage, SubmitButton } from "@/components/form-bits";

export function LoginForm() {
  const [state, action] = useActionState(enterWithCode, undefined);
  return (
    <form action={action} className="flex flex-col gap-5">
      <Field
        label="Tên của bạn"
        name="name"
        required
        maxLength={60}
        autoComplete="nickname"
        placeholder="Ví dụ: Minh Sơn"
        hint="Tên này được ghi dưới bài bạn viết."
      />
      <Field
        label="Mã truy cập"
        name="code"
        type="password"
        required
        autoComplete="off"
        className="font-mono"
        hint="Hỏi bạn quản lý trang để lấy mã."
      />
      <FormMessage state={state} />
      <SubmitButton className="w-full">Vào Góc viết</SubmitButton>
    </form>
  );
}
