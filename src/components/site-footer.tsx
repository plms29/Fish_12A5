import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="binary-grid mt-24 border-t-2 border-ink text-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="sticker max-w-sm p-5">
          <p className="font-display text-xl font-extrabold">Bể cá 12A5</p>
          <p className="mt-1 text-sm text-ink-soft">
            Nhật ký nuôi cá của lớp A5K41, trường THPT Chuyên Lê Quý Đôn. Viết bởi chính các bạn trong lớp.
          </p>
        </div>
        <div className="sticker-sm flex gap-4 bg-card px-4 py-2 font-mono text-xs font-bold">
          <Link href="/" className="hover:underline">Nhật ký</Link>
          <Link href="/giai-doan" className="hover:underline">Giai đoạn</Link>
          <Link href="/thu-vien" className="hover:underline">Thư viện</Link>
          <Link href="/viet" className="hover:underline">Viết</Link>
        </div>
      </div>
    </footer>
  );
}
