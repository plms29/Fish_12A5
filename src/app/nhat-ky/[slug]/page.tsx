import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DateStamp, Tag } from "@/components/bits";
import { getEntryBySlug, getNeighbours, getPhases } from "@/lib/data";
import { formatLongDate, mediaUrl } from "@/lib/format";
import { cleanEntryHtml } from "@/lib/sanitize";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/nhat-ky/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Không tìm thấy" };
  const cover = mediaUrl(entry.cover_path);
  return {
    title: entry.title,
    description: entry.excerpt || undefined,
    openGraph: { title: entry.title, description: entry.excerpt, images: cover ? [cover] : undefined },
  };
}

export default async function EntryPage({ params }: PageProps<"/nhat-ky/[slug]">) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  const [phases, { older, newer }] = await Promise.all([getPhases(), getNeighbours(entry)]);
  const phase = phases.find((p) => p.id === entry.phase_id);
  const html = cleanEntryHtml(entry.content_html);

  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <Link href="/" className="font-mono text-xs font-bold text-muted hover:text-ink">
        ← Tất cả trang nhật ký
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <DateStamp className="rounded-md border-[1.5px] border-ink bg-mint px-2 py-1">
            {formatLongDate(entry.entry_date)}
          </DateStamp>
          {phase && (
            <Link
              href={`/giai-doan/${phase.slug}`}
              className="font-mono text-xs font-bold text-grass-deep underline-offset-2 hover:underline"
            >
              Giai đoạn: {phase.title}
            </Link>
          )}
        </div>
        <h1 className="mt-5 font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.02] font-extrabold tracking-[-0.025em] text-balance">
          {entry.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {entry.tags.map((t) => (
            <Tag key={t} value={t} />
          ))}
          {entry.author_name && <span className="text-sm text-muted">Viết bởi {entry.author_name}</span>}
        </div>
      </header>

      <hr className="my-8 border-0 border-t-2 border-dashed border-ink/25" />

      <div className="prose-diary" dangerouslySetInnerHTML={{ __html: html }} />

      <nav className="mt-16 grid gap-4 sm:grid-cols-2" aria-label="Trang nhật ký khác">
        {older ? (
          <Link href={`/nhat-ky/${older.slug}`} className="sticker press p-4">
            <span className="font-mono text-[11px] font-bold tracking-wider text-muted uppercase">← Trang trước</span>
            <span className="mt-1 block font-display text-lg leading-snug font-bold">{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer && newer.slug !== older?.slug && (
          <Link href={`/nhat-ky/${newer.slug}`} className="sticker press p-4 text-right">
            <span className="font-mono text-[11px] font-bold tracking-wider text-muted uppercase">Trang sau →</span>
            <span className="mt-1 block font-display text-lg leading-snug font-bold">{newer.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
