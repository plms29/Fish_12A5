import Link from "next/link";
import { formatDate, mediaUrl, weekday } from "@/lib/format";
import type { EntryCard as EntryCardT } from "@/lib/types";
import { Tag } from "./bits";

/** Một dòng trên dòng thời gian: cột ngày bên trái, thẻ sticker bên phải. */
export function TimelineEntry({ entry, featured = false }: { entry: EntryCardT; featured?: boolean }) {
  const cover = mediaUrl(entry.cover_path);
  return (
    <li className="relative grid gap-3 sm:grid-cols-[132px_1fr] sm:gap-8">
      {/* Cột ngày */}
      <div className="flex items-baseline gap-2 sm:block sm:pt-4 sm:text-right">
        <span className="font-mono text-sm font-bold">{formatDate(entry.entry_date)}</span>
        <span className="text-xs font-semibold text-muted sm:mt-0.5 sm:block">{weekday(entry.entry_date)}</span>
      </div>

      {/* Chấm trên trục */}
      <span
        aria-hidden="true"
        className="absolute top-5 left-[147px] hidden size-3.5 rotate-45 rounded-[3px] border-2 border-ink bg-grass sm:block"
      />

      <Link
        href={`/nhat-ky/${entry.slug}`}
        className={`sticker press group block overflow-hidden ${featured ? "" : ""}`}
      >
        <article className={cover && featured ? "grid md:grid-cols-[1.1fr_1fr]" : ""}>
          {cover && (
            <div
              className={`overflow-hidden border-ink bg-paper-2 ${
                featured ? "aspect-[4/3] border-b-2 md:aspect-auto md:border-r-2 md:border-b-0" : "aspect-[16/7] border-b-2"
              }`}
            >
              <img
                src={cover}
                alt=""
                loading="lazy"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          )}
          <div className={featured ? "flex flex-col justify-center p-6 sm:p-8" : "p-5 sm:p-6"}>
            {featured && (
              <span className="mb-3 inline-block w-fit rounded-md border-[1.5px] border-ink bg-sun px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase">
                Mới nhất
              </span>
            )}
            <h3
              className={`font-display font-extrabold tracking-tight text-balance ${
                featured ? "text-3xl leading-[1.05] sm:text-4xl" : "text-xl leading-snug sm:text-2xl"
              }`}
            >
              {entry.title}
            </h3>
            {entry.excerpt && (
              <p className={`mt-2 text-ink-soft ${featured ? "line-clamp-4 text-base" : "line-clamp-2 text-[15px]"}`}>
                {entry.excerpt}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {entry.tags.map((t) => (
                <Tag key={t} value={t} />
              ))}
              {entry.author_name && (
                <span className="text-xs font-medium text-muted">— {entry.author_name}</span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </li>
  );
}
