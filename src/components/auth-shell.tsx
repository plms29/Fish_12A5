export function AuthShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="binary-faint min-h-[70dvh] border-b-2 border-ink">
      <div className="mx-auto grid max-w-5xl items-start gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.1fr] md:py-20">
        <div className="md:pt-6">
          <p className="font-mono text-xs font-bold tracking-[0.22em] text-grass-deep uppercase">{eyebrow}</p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.02] font-extrabold tracking-tight text-balance">
            {title}
          </h1>
          <p className="mt-4 max-w-sm text-ink-soft">
            Ai cũng đọc được nhật ký mà không cần tài khoản. Chỉ người viết bài mới cần nhập mã của lớp.
          </p>
        </div>
        <div className="sticker p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
