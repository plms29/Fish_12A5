"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { addComment, deleteComment, editComment, whoAmI } from "@/app/nhat-ky/comment-actions";
import type { FormState } from "@/app/auth-actions";
import { FormMessage, SubmitButton } from "@/components/form-bits";

export type CommentData = { id: string; author_name: string; body: string; created_at: string; edited_at: string | null };

const textarea =
  "w-full rounded-[10px] border-2 border-ink bg-card px-3.5 py-2.5 text-[15px] shadow-[2px_2px_0_var(--ink)] outline-none placeholder:text-muted/70 focus:bg-mint-soft";
const linkBtn = "font-mono text-xs font-bold text-grass-deep underline-offset-2 hover:underline";

function Item({ c, slug, mine }: { c: CommentData; slug: string; mine: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState(async (prev: FormState, fd: FormData) => {
    const res = await editComment(c.id, slug, prev, fd);
    if (res?.ok) setEditing(false);
    return res;
  }, undefined);
  const [pending, start] = useTransition();

  return (
    <li className="sticker-sm bg-card p-4">
      <p className="text-sm font-bold">
        {c.author_name}{" "}
        <time className="ml-1 font-mono text-xs font-normal text-muted" dateTime={c.created_at}>
          {new Date(c.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
        </time>
        {c.edited_at && <span className="ml-1 font-mono text-xs font-normal text-muted">(đã sửa)</span>}
      </p>
      {editing ? (
        <form action={action} className="mt-2 flex flex-col gap-2">
          <textarea name="body" required maxLength={1000} rows={3} defaultValue={c.body} aria-label="Sửa bình luận" className={textarea} />
          <FormMessage state={state} />
          <div className="flex gap-3">
            <SubmitButton>Lưu</SubmitButton>
            <button type="button" onClick={() => setEditing(false)} className={linkBtn}>
              Huỷ
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-1.5 break-words whitespace-pre-wrap">{c.body}</p>
      )}
      {mine && !editing && (
        <div className="mt-2 flex gap-4">
          <button type="button" onClick={() => setEditing(true)} className={linkBtn}>
            Sửa
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => confirm("Xoá bình luận này?") && start(() => deleteComment(c.id, slug))}
            className={`${linkBtn} text-red-700 disabled:opacity-50`}
          >
            {pending ? "Đang xoá…" : "Xoá"}
          </button>
        </div>
      )}
    </li>
  );
}

/** Danh sách + ô viết. Trang bài được cache nên "ai đang đăng nhập" hỏi riêng ở trình duyệt. */
export function CommentThread({ entryId, slug, comments }: { entryId: string; slug: string; comments: CommentData[] }) {
  const [me, setMe] = useState<string | null | undefined>(undefined);
  const [state, action] = useActionState(addComment.bind(null, entryId, slug), undefined);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    void whoAmI().then(setMe);
  }, []);
  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);

  return (
    <>
      <ul className="mt-5 flex flex-col gap-3">
        {comments.map((c) => (
          <Item key={c.id} c={c} slug={slug} mine={!!me && me === c.author_name} />
        ))}
      </ul>
      <div className="mt-6">
        {me === undefined ? null : me === null ? (
          <p className="sticker-sm bg-card p-4 text-sm">
            <Link href={`/dang-nhap?next=${encodeURIComponent(`/nhat-ky/${slug}`)}`} className="font-bold text-grass-deep underline">
              Đăng nhập
            </Link>{" "}
            để viết bình luận.
          </p>
        ) : (
          <form ref={form} action={action} className="flex flex-col gap-3">
            <textarea name="body" required maxLength={1000} rows={3} placeholder={`Bình luận với tên ${me}…`} aria-label="Bình luận" className={textarea} />
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            <FormMessage state={state} />
            <SubmitButton className="self-start">Gửi bình luận</SubmitButton>
          </form>
        )}
      </div>
    </>
  );
}
