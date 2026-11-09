import { tagMeta } from "@/lib/format";

/** Ngôi sao bốn cánh như trong logo. Dùng tiết chế. */
export function Sparkle({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
    </svg>
  );
}

export function Tag({ value }: { value: string }) {
  const t = tagMeta(value);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-ink bg-card px-2 py-0.5 text-xs font-semibold"
    >
      <span
        aria-hidden="true"
        className="size-2.5 rounded-[3px] border-[1.5px] border-ink"
        style={{ background: t.color }}
      />
      {t.label}
    </span>
  );
}

/** Nhãn ngày dạng mono, gợi chất "binary" của logo. */
export function DateStamp({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-xs font-bold tracking-wide uppercase ${className}`}>{children}</span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="sticker flex flex-col items-center gap-4 px-6 py-12 text-center">
      <img
        src="/logo-256.webp"
        alt=""
        width={112}
        height={112}
        className="size-28 -rotate-3 rounded-full border-2 border-ink"
      />
      <p className="font-display text-2xl font-extrabold">{title}</p>
      {children && <div className="max-w-md text-ink-soft">{children}</div>}
    </div>
  );
}
