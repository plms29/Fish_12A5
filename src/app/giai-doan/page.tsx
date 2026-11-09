import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/bits";
import { getPhases, getPublishedEntries } from "@/lib/data";
import { mediaUrl, phaseRange } from "@/lib/format";

export const revalidate = 60;
export const metadata: Metadata = { title: "Các giai đoạn của bể" };

export default async function PhasesPage() {
  const [phases, entries] = await Promise.all([getPhases(), getPublishedEntries()]);
  const count = (id: string) => entries.filter((e) => e.phase_id === id).length;
  const coverFor = (id: string, own: string | null) =>
    mediaUrl(own ?? entries.find((e) => e.phase_id === id && e.cover_path)?.cover_path ?? null);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <p className="font-mono text-xs font-bold tracking-[0.22em] text-grass-deep uppercase">Theo từng chương</p>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] leading-none font-extrabold tracking-tight">
        Các giai đoạn của bể
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Bể cá đổi cư dân theo thời gian. Mỗi giai đoạn là một chương riêng của cuốn nhật ký.
      </p>

      {phases.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="Chưa có giai đoạn nào" />
        </div>
      ) : (
        <ol className="mt-12 flex flex-col gap-8">
          {[...phases].reverse().map((p, i, arr) => {
            const cover = coverFor(p.id, p.cover_path);
            const n = count(p.id);
            const number = arr.length - i;
            const isCurrent = !p.end_date;
            return (
              <li key={p.id}>
                <Link
                  href={`/giai-doan/${p.slug}`}
                  className="sticker press group grid overflow-hidden md:grid-cols-[220px_1fr]"
                >
                  <div className="binary-grid relative flex min-h-40 items-end border-b-2 border-ink p-5 md:border-r-2 md:border-b-0">
                    {cover && (
                      <img src={cover} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
                    )}
                    <span className="relative font-display text-7xl leading-none font-extrabold text-white [text-shadow:3px_3px_0_var(--ink)]">
                      {String(number).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-bold">{phaseRange(p.start_date, p.end_date)}</span>
                      {isCurrent && (
                        <span className="rounded-md border-[1.5px] border-ink bg-grass px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-white uppercase">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{p.title}</h2>
                    {p.description && <p className="mt-2 max-w-2xl text-ink-soft">{p.description}</p>}
                    <p className="mt-4 font-mono text-xs font-bold text-muted">
                      {n} trang nhật ký <span className="text-ink transition-transform group-hover:translate-x-1">→</span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
