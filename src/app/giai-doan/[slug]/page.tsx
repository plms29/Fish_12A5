import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/bits";
import { Timeline } from "@/components/timeline";
import { getPhaseBySlug, getPhases, getPublishedEntries } from "@/lib/data";
import { phaseRange } from "@/lib/format";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/giai-doan/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const phase = await getPhaseBySlug(slug);
  return { title: phase ? `Giai đoạn: ${phase.title}` : "Không tìm thấy" };
}

export default async function PhasePage({ params }: PageProps<"/giai-doan/[slug]">) {
  const { slug } = await params;
  const phase = await getPhaseBySlug(slug);
  if (!phase) notFound();
  const [phases, entries] = await Promise.all([getPhases(), getPublishedEntries({ phaseId: phase.id })]);

  return (
    <>
      <section className="binary-grid border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/giai-doan"
            className="sticker-sm inline-block bg-card px-2.5 py-1 font-mono text-xs font-bold hover:bg-mint"
          >
            ← Mọi giai đoạn
          </Link>
          <div className="sticker mt-6 max-w-3xl p-6 sm:p-8">
            <p className="font-mono text-xs font-bold tracking-wider">{phaseRange(phase.start_date, phase.end_date)}</p>
            <h1 className="mt-2 font-display text-[clamp(2.2rem,6vw,3.8rem)] leading-none font-extrabold tracking-tight">
              {phase.title}
            </h1>
            {phase.description && <p className="mt-4 text-lg text-ink-soft">{phase.description}</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        {entries.length > 0 ? (
          <Timeline entries={entries} phases={phases} featureFirst={false} />
        ) : (
          <EmptyState title="Chương này chưa có trang nào">
            <p>Khi có bài nhật ký gắn với giai đoạn này, chúng sẽ xuất hiện ở đây.</p>
          </EmptyState>
        )}
      </section>
    </>
  );
}
