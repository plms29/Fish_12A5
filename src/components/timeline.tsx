import Link from "next/link";
import { formatDate, monthKey, monthLabel } from "@/lib/format";
import type { EntryCard, Phase } from "@/lib/types";
import { Sparkle } from "./bits";
import { TimelineEntry } from "./entry-card";

type Row =
  | { kind: "month"; key: string; label: string }
  | { kind: "entry"; entry: EntryCard; featured: boolean }
  | { kind: "chapter"; phase: Phase; label: string };

/**
 * Dòng thời gian mới → cũ, chia theo tháng. Khi bài liền kề thuộc hai giai đoạn
 * khác nhau thì chèn một mốc "chương mới".
 */
export function Timeline({
  entries,
  phases,
  featureFirst = true,
}: {
  entries: EntryCard[];
  phases: Phase[];
  featureFirst?: boolean;
}) {
  const byId = new Map(phases.map((p) => [p.id, p]));
  const rows: Row[] = [];
  let lastMonth = "";

  entries.forEach((e, i) => {
    const prev = entries[i - 1];
    if (prev && prev.phase_id !== e.phase_id) {
      const newer = prev.phase_id ? byId.get(prev.phase_id) : undefined;
      if (newer) rows.push({ kind: "chapter", phase: newer, label: "Chương mới bắt đầu" });
    }
    const mk = monthKey(e.entry_date);
    if (mk !== lastMonth) {
      rows.push({ kind: "month", key: mk, label: monthLabel(e.entry_date) });
      lastMonth = mk;
    }
    rows.push({ kind: "entry", entry: e, featured: featureFirst && i === 0 });
  });

  const oldest = entries.at(-1);
  const firstPhase = oldest?.phase_id ? byId.get(oldest.phase_id) : undefined;
  if (firstPhase) rows.push({ kind: "chapter", phase: firstPhase, label: "Khởi đầu" });

  return (
    <div className="relative">
      {/* Trục dọc */}
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[153px] hidden w-0.5 bg-ink sm:block"
      />
      <ol className="relative flex flex-col gap-7">
        {rows.map((row, i) => {
          if (row.kind === "month") {
            return (
              <li key={`m-${row.key}`} className="sm:grid sm:grid-cols-[132px_1fr] sm:gap-8">
                <h2 className="font-mono text-xs font-bold tracking-[0.16em] whitespace-nowrap text-grass-deep uppercase sm:text-right">
                  {row.label}
                </h2>
              </li>
            );
          }
          if (row.kind === "chapter") {
            return (
              <li key={`c-${row.phase.id}-${i}`} className="relative z-10 my-3">
                <Link
                  href={`/giai-doan/${row.phase.slug}`}
                  className="sticker press binary-grid group flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-paper"
                >
                  <Sparkle className="text-mint" size={20} />
                  <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-mint uppercase">
                    {row.label}
                  </span>
                  <span className="font-display text-2xl font-extrabold text-white [text-shadow:2px_2px_0_var(--ink)]">
                    {row.phase.title}
                  </span>
                  {row.phase.start_date && (
                    <span className="ml-auto rounded-md border-[1.5px] border-ink bg-card px-2 py-0.5 font-mono text-xs font-bold text-ink">
                      từ {formatDate(row.phase.start_date)}
                    </span>
                  )}
                </Link>
              </li>
            );
          }
          return <TimelineEntry key={row.entry.id} entry={row.entry} featured={row.featured} />;
        })}
      </ol>
    </div>
  );
}
