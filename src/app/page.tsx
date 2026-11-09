import Link from "next/link";
import { EmptyState, Sparkle } from "@/components/bits";
import { Timeline } from "@/components/timeline";
import { getPhases, getPublishedEntries } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function HomePage() {
  const [phases, entries] = await Promise.all([getPhases(), getPublishedEntries()]);
  const current = [...phases].reverse().find((p) => !p.end_date) ?? phases.at(-1);

  return (
    <>
      {/* ---------- Mở đầu ---------- */}
      <section className="binary-faint border-b-2 border-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-14 sm:px-6 md:grid-cols-[1.25fr_1fr] md:pt-16 md:pb-20">
          <div>
            <p className="font-mono text-xs font-bold tracking-[0.22em] text-grass-deep uppercase">
              Lớp 12A5 · THPT Chuyên Lê Quý Đôn
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.2rem)] leading-[0.95] font-extrabold tracking-[-0.03em] text-balance">
              Nhật ký <span className="marker">bể cá</span> của lớp mình
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              Mỗi lần cho ăn, thay nước, đón cá mới hay lỡ tay làm đục nước đều được ghi lại ở đây, kèm ảnh và
              video do chính các bạn trong lớp chụp.
            </p>

            {current && (
              <Link
                href={`/giai-doan/${current.slug}`}
                className="sticker press mt-8 inline-flex items-center gap-4 py-3 pr-5 pl-3"
              >
                <span className="grid size-11 place-items-center rounded-lg border-2 border-ink bg-grass text-mint">
                  <Sparkle size={20} />
                </span>
                <span className="leading-tight">
                  <span className="block font-mono text-[11px] font-bold tracking-[0.18em] text-muted uppercase">
                    Đang nuôi
                  </span>
                  <span className="block font-display text-xl font-extrabold">{current.title}</span>
                  {current.start_date && (
                    <span className="block text-sm text-ink-soft">từ {formatDate(current.start_date)}</span>
                  )}
                </span>
              </Link>
            )}
          </div>

          {/* Logo như một sticker dán trên mảng lưới nhị phân */}
          <div className="relative mx-auto w-full max-w-sm md:max-w-none">
            <div className="binary-grid aspect-square rotate-2 rounded-[28px] border-2 border-ink shadow-[6px_6px_0_var(--ink)]" />
            <img
              src="/logo-900.webp"
              alt="Logo lớp ASYMPTOTIC A5K41 — chú gấu trúc ngồi bên laptop"
              width={900}
              height={900}
              className="absolute inset-[7%] size-[86%] -rotate-3 rounded-[22px] border-2 border-ink object-cover shadow-[4px_4px_0_var(--ink)]"
            />
            <Sparkle className="absolute -top-3 -left-3 text-ink" size={26} />
            <Sparkle className="absolute right-6 -bottom-4 text-ink" size={18} />
          </div>
        </div>
      </section>

      {/* ---------- Dòng thời gian ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Các trang nhật ký</h2>
          <p className="font-mono text-xs font-bold text-muted">
            {entries.length.toString().padStart(3, "0")} trang
          </p>
        </div>

        {entries.length > 0 ? (
          <Timeline entries={entries} phases={phases} />
        ) : (
          <EmptyState title="Chưa có trang nhật ký nào">
            <p>
              Trang đầu tiên đang chờ được viết.{" "}
              <Link href="/viet" className="font-semibold text-grass-deep underline underline-offset-2">
                Viết ngay
              </Link>{" "}
              nếu bạn là người giữ sổ.
            </p>
          </EmptyState>
        )}
      </section>
    </>
  );
}
