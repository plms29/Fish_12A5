"use client";

import { useActionState } from "react";
import { updateDisplayName, updateInviteCode } from "@/app/viet/actions";
import { Field, FormMessage, SubmitButton } from "@/components/form-bits";

export function SettingsForms({ name, invite }: { name: string; invite: string }) {
  const [nameState, nameAction] = useActionState(updateDisplayName, undefined);
  const [inviteState, inviteAction] = useActionState(updateInviteCode, undefined);

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <form action={nameAction} className="sticker flex flex-col gap-4 p-6">
        <h2 className="font-display text-xl font-extrabold">Tên người viết</h2>
        <p className="-mt-2 text-sm text-ink-soft">Tên này được ghi dưới các bài bạn viết trên máy này.</p>
        <Field label="Tên" name="name" defaultValue={name} maxLength={60} required />
        <FormMessage state={nameState} />
        <SubmitButton className="self-start">Lưu tên</SubmitButton>
      </form>

      <form action={inviteAction} className="sticker flex flex-col gap-4 p-6">
        <h2 className="font-display text-xl font-extrabold">Mã truy cập</h2>
        <p className="-mt-2 text-sm text-ink-soft">
          Ai có mã này đều vào được Góc viết. Đổi mã nếu lỡ để lộ: người nhập mã cũ sẽ không vào được nữa.
        </p>
        <Field label="Mã mới" name="invite" defaultValue={invite} minLength={6} required className="font-mono" />
        <FormMessage state={inviteState} />
        <SubmitButton className="self-start">Đổi mã</SubmitButton>
      </form>
    </div>
  );
}
