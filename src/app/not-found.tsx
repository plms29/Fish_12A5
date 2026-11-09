import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-20 text-center">
      <p className="font-mono text-sm font-bold tracking-[0.3em] text-grass-deep">01000100 · 404</p>
      <img
        src="/logo-256.webp"
        alt=""
        width={160}
        height={160}
        className="mt-6 size-40 rotate-6 rounded-full border-2 border-ink shadow-[4px_4px_0_var(--ink)]"
      />
      <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight">Trang này bơi đi mất rồi</h1>
      <p className="mt-3 text-ink-soft">Có thể đường dẫn đã đổi, hoặc bài viết chưa được đăng.</p>
      <Link href="/" className="sticker press mt-8 bg-mint px-5 py-2.5 font-bold">
        Về trang nhật ký
      </Link>
    </div>
  );
}
