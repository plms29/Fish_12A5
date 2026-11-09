"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Item = {
  id: string;
  kind: "image" | "video";
  src: string;
  width: number | null;
  height: number | null;
  caption: string;
  entryTitle: string;
  entrySlug: string;
  date: string;
};

export function Gallery({ items }: { items: Item[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  const current = index === null ? null : items[index];

  return (
    <>
      <ul className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>li]:mb-4">
        {items.map((m, i) => (
          <li key={m.id} className="break-inside-avoid">
            <button
              type="button"
              onClick={() => open(i)}
              className="sticker press group relative block w-full overflow-hidden text-left"
              aria-label={`Xem ${m.kind === "video" ? "video" : "ảnh"} trong “${m.entryTitle}”`}
            >
              {m.kind === "image" ? (
                <img
                  src={m.src}
                  alt={m.caption}
                  width={m.width ?? undefined}
                  height={m.height ?? undefined}
                  loading="lazy"
                  className="block h-auto w-full"
                />
              ) : (
                <>
                  <video src={`${m.src}#t=0.5`} preload="metadata" muted playsInline className="block h-auto w-full" />
                  <span className="absolute top-2 left-2 rounded-md border-[1.5px] border-ink bg-sun px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase">
                    Video
                  </span>
                </>
              )}
              <span className="block border-t-2 border-ink px-3 py-2 font-mono text-[11px] font-bold">{m.date}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto max-h-[92dvh] w-[min(1100px,94vw)] bg-transparent p-0 backdrop:bg-ink/80"
      >
        {current && (
          <div className="sticker overflow-hidden">
            <div className="flex items-center gap-3 border-b-2 border-ink px-4 py-2.5">
              <span className="font-mono text-xs font-bold">{current.date}</span>
              <Link
                href={`/nhat-ky/${current.entrySlug}`}
                className="truncate text-sm font-semibold underline-offset-2 hover:underline"
              >
                {current.entryTitle}
              </Link>
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={() => step(-1)} className="sticker-sm bg-card px-2.5 py-1 text-sm font-bold" aria-label="Ảnh trước">
                  ←
                </button>
                <button type="button" onClick={() => step(1)} className="sticker-sm bg-card px-2.5 py-1 text-sm font-bold" aria-label="Ảnh sau">
                  →
                </button>
                <button type="button" onClick={close} className="sticker-sm bg-ink px-2.5 py-1 text-sm font-bold text-paper">
                  Đóng
                </button>
              </div>
            </div>
            <div className="grid max-h-[78dvh] place-items-center bg-ink">
              {current.kind === "image" ? (
                <img src={current.src} alt={current.caption} className="max-h-[78dvh] w-auto object-contain" />
              ) : (
                <video key={current.id} src={current.src} controls autoPlay playsInline className="max-h-[78dvh] w-auto" />
              )}
            </div>
            {current.caption && <p className="border-t-2 border-ink px-4 py-3 text-sm">{current.caption}</p>}
          </div>
        )}
      </dialog>
    </>
  );
}
