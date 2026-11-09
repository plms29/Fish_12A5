"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { revalidateSite } from "@/app/viet/actions";
import { slugify } from "@/lib/format";
import { createBrowser } from "@/lib/supabase/browser";
import type { Phase } from "@/lib/types";

type Draft = Pick<Phase, "title" | "description" | "start_date" | "end_date">;

function makeSlug(title: string) {
  return `${slugify(title) || "giai-doan"}-${crypto.randomUUID().slice(0, 4)}`;
}

const inputCls = "w-full rounded-[10px] border-2 border-ink bg-card px-3 py-2 text-sm";

function PhaseForm({
  value,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  value: Draft;
  submitLabel: string;
  onSubmit: (d: Draft) => Promise<void>;
  onCancel?: () => void;
}) {
  const [d, setD] = useState(value);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await onSubmit(d);
        setBusy(false);
      }}
    >
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-bold">Tên giai đoạn</span>
        <input required className={inputCls} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-bold">Giới thiệu ngắn</span>
        <textarea
          rows={3}
          className={inputCls}
          value={d.description}
          onChange={(e) => setD({ ...d, description: e.target.value })}
        />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-bold">Bắt đầu</span>
        <input
          type="date"
          className={`${inputCls} font-mono`}
          value={d.start_date ?? ""}
          onChange={(e) => setD({ ...d, start_date: e.target.value || null })}
        />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-bold">Kết thúc (để trống nếu đang diễn ra)</span>
        <input
          type="date"
          className={`${inputCls} font-mono`}
          value={d.end_date ?? ""}
          onChange={(e) => setD({ ...d, end_date: e.target.value || null })}
        />
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" disabled={busy} className="sticker press bg-grass px-4 py-2 font-bold text-white disabled:opacity-60">
          {busy ? "Đang lưu…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm font-semibold">
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}

export function PhaseManager({ initial }: { initial: Phase[] }) {
  const router = useRouter();
  const supabase = createBrowser();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function done() {
    await revalidateSite();
    setEditing(null);
    setAdding(false);
    router.refresh();
  }

  async function update(id: string, d: Draft) {
    setError(null);
    const { error } = await supabase.from("phases").update(d).eq("id", id);
    if (error) return setError(error.message);
    await done();
  }

  async function create(d: Draft) {
    setError(null);
    const sort = Math.max(0, ...initial.map((p) => p.sort_order)) + 1;
    const slug = makeSlug(d.title);
    const { error } = await supabase.from("phases").insert({ ...d, slug, sort_order: sort });
    if (error) return setError(error.message);
    await done();
  }

  async function remove(p: Phase) {
    if (!window.confirm(`Xoá giai đoạn “${p.title}”? Các bài viết vẫn còn, chỉ không còn gắn với giai đoạn này.`)) return;
    const { error } = await supabase.from("phases").delete().eq("id", p.id);
    if (error) return setError(error.message);
    await done();
  }

  return (
    <div className="mt-8 flex flex-col gap-5">
      {error && (
        <p role="alert" className="rounded-[10px] border-2 border-ink bg-[#fde3df] px-4 py-2.5 text-sm font-semibold">
          {error}
        </p>
      )}
      {initial.map((p, i) => (
        <div key={p.id} className="sticker p-5 sm:p-6">
          {editing === p.id ? (
            <PhaseForm value={p} submitLabel="Lưu" onSubmit={(d) => update(p.id, d)} onCancel={() => setEditing(null)} />
          ) : (
            <div className="flex flex-wrap items-start gap-4">
              <span className="font-display text-4xl leading-none font-extrabold text-grass">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-extrabold">{p.title}</p>
                <p className="mt-0.5 font-mono text-xs font-bold text-muted">
                  {p.start_date ?? "chưa rõ ngày"} → {p.end_date ?? "nay"}
                </p>
                {p.description && <p className="mt-2 text-sm text-ink-soft">{p.description}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(p.id)} className="sticker-sm bg-card px-3 py-1 text-sm font-bold hover:bg-mint">
                  Sửa
                </button>
                <button type="button" onClick={() => remove(p)} className="px-2 py-1 text-sm font-semibold text-tomato hover:underline">
                  Xoá
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div className="sticker bg-mint-soft p-5 sm:p-6">
          <PhaseForm
            value={{ title: "", description: "", start_date: null, end_date: null }}
            submitLabel="Thêm giai đoạn"
            onSubmit={create}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-[14px] border-2 border-dashed border-ink px-5 py-4 font-bold hover:bg-mint-soft"
        >
          + Thêm giai đoạn mới
        </button>
      )}
    </div>
  );
}
