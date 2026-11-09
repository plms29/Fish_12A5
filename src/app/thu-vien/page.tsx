import type { Metadata } from "next";
import { EmptyState } from "@/components/bits";
import { Gallery } from "@/components/gallery";
import { getGallery } from "@/lib/data";
import { formatDate, mediaUrl } from "@/lib/format";

export const revalidate = 60;
export const metadata: Metadata = { title: "Thư viện ảnh & video" };

export default async function GalleryPage() {
  const items = await getGallery();
  const data = items.map((m) => ({
    id: m.id,
    kind: m.kind,
    src: mediaUrl(m.path)!,
    width: m.width,
    height: m.height,
    caption: m.caption,
    entryTitle: m.entry?.title ?? "",
    entrySlug: m.entry?.slug ?? "",
    date: m.entry ? formatDate(m.entry.entry_date) : "",
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.22em] text-grass-deep uppercase">Ảnh & video</p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] leading-none font-extrabold tracking-tight">
            Thư viện
          </h1>
        </div>
        <p className="font-mono text-xs font-bold text-muted">{String(data.length).padStart(3, "0")} tệp</p>
      </div>

      <div className="mt-10">
        {data.length > 0 ? (
          <Gallery items={data} />
        ) : (
          <EmptyState title="Chưa có ảnh hay video nào">
            <p>Ảnh và video trong các bài nhật ký đã đăng sẽ tự động xuất hiện ở đây.</p>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
