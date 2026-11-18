"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { addComment } from "@/app/nhat-ky/comment-actions";
import { FormMessage, SubmitButton } from "@/components/form-bits";
import { createBrowser } from "@/lib/supabase/browser";

/** Ô viết bình luận; trang bài được cache nên trạng thái đăng nhập kiểm tra ở trình duyệt. */
export function CommentBox({ entryId, slug }: { entryId: string; slug: string }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [state, action] = useActionState(addComment.bind(null, entryId, slug), undefined);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await createBrowser().auth.getUser();
      setLoggedIn(!!data.user);
    })();
  }, []);
  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);

  if (loggedIn === null) return null;
  if (!loggedIn)
    return (
      <p className="sticker-sm bg-card p-4 text-sm">
        <Link
          href={`/dang-nhap?next=${encodeURIComponent(`/nhat-ky/${slug}`)}`}
          className="font-bold text-grass-deep underline"
        >
          Đăng nhập
        </Link>{" "}
        để viết bình luận.
      </p>
    );

  return (
    <form ref={form} action={action} className="flex flex-col gap-3">
      <textarea
        name="body"
        required
        maxLength={1000}
        rows={3}
        placeholder="Viết bình luận…"
        aria-label="Bình luận"
        className="w-full rounded-[10px] border-2 border-ink bg-card px-3.5 py-2.5 text-[15px] shadow-[2px_2px_0_var(--ink)] outline-none placeholder:text-muted/70 focus:bg-mint-soft"
      />
      <FormMessage state={state} />
      <SubmitButton className="self-start">Gửi bình luận</SubmitButton>
    </form>
  );
}
