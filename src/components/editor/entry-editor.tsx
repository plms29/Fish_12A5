"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { revalidateSite } from "@/app/viet/actions";
import { slugify, TAGS, todayVN } from "@/lib/format";
import { createBrowser } from "@/lib/supabase/browser";
import type { Entry, Phase } from "@/lib/types";
import { pathFromUrl, uploadMedia, type Uploaded } from "@/lib/upload";
import { Video } from "./video-node";

type Props = {
  phases: Phase[];
  entry?: Entry;
  author: { id: string; name: string };
};

/** Giai đoạn bao trùm một ngày, ưu tiên giai đoạn bắt đầu muộn nhất. */
function phaseForDate(phases: Phase[], date: string) {
  const hits = phases.filter((p) => (!p.start_date || p.start_date <= date) && (!p.end_date || date < p.end_date));
  return (hits.at(-1) ?? phases.at(-1))?.id ?? "";
}

/** Gom mọi ảnh/video trong bài theo thứ tự xuất hiện. */
function collectMedia(doc: JSONContent) {
  const out: { kind: "image" | "video"; path: string }[] = [];
  const walk = (n: JSONContent) => {
    if ((n.type === "image" || n.type === "video") && typeof n.attrs?.src === "string") {
      const path = pathFromUrl(n.attrs.src);
      if (path) out.push({ kind: n.type, path });
    }
    n.content?.forEach(walk);
  };
  walk(doc);
  return out;
}

export function EntryEditor({ phases, entry, author }: Props) {
  const router = useRouter();
  const supabase = createBrowser();
  const fileRef = useRef<HTMLInputElement>(null);
  const dims = useRef(new Map<string, { width: number | null; height: number | null }>());

  const [title, setTitle] = useState(entry?.title ?? "");
  const [date, setDate] = useState(entry?.entry_date ?? todayVN());
  const [phaseId, setPhaseId] = useState(entry?.phase_id ?? phaseForDate(phases, entry?.entry_date ?? todayVN()));
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState<null | "draft" | "published">(null);
  const [message, setMessage] = useState<{ type: "error" | "ok"; text: string } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false }),
      Video,
      Youtube.configure({ nocookie: true, modestBranding: true, width: 640, height: 360 }),
      Placeholder.configure({ placeholder: "Hôm nay bể cá có gì mới? Kể lại nhé…" }),
    ],
    content: (entry?.content_json as JSONContent) ?? "",
    editorProps: {
      attributes: { class: "prose-diary tiptap", "aria-label": "Nội dung nhật ký" },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (!files.length) return false;
        event.preventDefault();
        void handleFiles(files);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (!files.length) return false;
        void handleFiles(files);
        return true;
      },
    },
  });

  const editorRef = useRef<Editor | null>(null);
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  async function handleFiles(files: File[]) {
    const editor = editorRef.current;
    if (!editor) return;
    setMessage(null);
    for (const file of files) {
      setUploading((n) => n + 1);
      try {
        const up: Uploaded = await uploadMedia(file);
        dims.current.set(up.path, { width: up.width, height: up.height });
        if (up.kind === "image") editor.chain().focus().setImage({ src: up.url, alt: "" }).run();
        else editor.chain().focus().setVideo({ src: up.url }).run();
      } catch (e) {
        setMessage({ type: "error", text: e instanceof Error ? e.message : "Tải tệp thất bại." });
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function addYoutube() {
    const url = window.prompt("Dán link YouTube:");
    if (!url || !editor) return;
    const ok = editor.chain().focus().setYoutubeVideo({ src: url }).run();
    if (!ok) setMessage({ type: "error", text: "Link YouTube chưa đúng." });
  }

  async function save(status: "draft" | "published") {
    if (!editor) return;
    if (!title.trim()) {
      setMessage({ type: "error", text: "Bài nhật ký cần có tiêu đề." });
      return;
    }
    if (uploading > 0) {
      setMessage({ type: "error", text: "Đợi tải xong ảnh/video đã nhé." });
      return;
    }
    setSaving(status);
    setMessage(null);

    const json = editor.getJSON();
    const media = collectMedia(json);
    const text = editor.getText({ blockSeparator: " " }).replace(/\s+/g, " ").trim();
    const excerpt = text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text;
    const id = entry?.id ?? crypto.randomUUID();
    const slug = entry?.slug ?? `${slugify(title) || "nhat-ky"}-${id.slice(0, 4)}`;

    const { error } = await supabase.from("entries").upsert({
      id,
      slug,
      title: title.trim(),
      excerpt,
      content_json: json,
      content_html: editor.getHTML(),
      entry_date: date,
      phase_id: phaseId || null,
      tags,
      cover_path: media.find((m) => m.kind === "image")?.path ?? null,
      status,
      author_id: entry?.author_id ?? author.id,
      author_name: entry?.author_name ?? author.name,
    });
    if (error) {
      setSaving(null);
      setMessage({ type: "error", text: `Không lưu được: ${error.message}` });
      return;
    }

    // Đồng bộ bảng media với nội dung bài (cho trang Thư viện).
    const { data: existing } = await supabase.from("media").select("id, path").eq("entry_id", id);
    const current = new Set(media.map((m) => m.path));
    const stale = (existing ?? []).filter((m: { path: string }) => !current.has(m.path));
    const known = new Set((existing ?? []).map((m: { path: string }) => m.path));
    const fresh = media.filter((m) => !known.has(m.path));
    if (stale.length) {
      await supabase.from("media").delete().in("id", stale.map((m: { id: string }) => m.id));
      await supabase.storage.from("media").remove(stale.map((m: { path: string }) => m.path));
    }
    if (fresh.length) {
      await supabase.from("media").insert(
        fresh.map((m) => ({
          entry_id: id,
          kind: m.kind,
          path: m.path,
          width: dims.current.get(m.path)?.width ?? null,
          height: dims.current.get(m.path)?.height ?? null,
          created_by: author.id,
        })),
      );
    }

    await revalidateSite();
    setSaving(null);
    if (!entry) {
      router.replace(`/viet/bai/${id}?da-luu=${status}`);
    } else {
      setMessage({
        type: "ok",
        text: status === "published" ? "Đã đăng! Trang công khai đã được cập nhật." : "Đã lưu bản nháp.",
      });
      router.refresh();
    }
  }

  async function remove() {
    if (!entry) return;
    if (!window.confirm(`Xoá hẳn bài “${entry.title}”? Ảnh và video trong bài cũng bị xoá, không khôi phục được.`)) return;
    const { data: rows } = await supabase.from("media").select("path").eq("entry_id", entry.id);
    const { error } = await supabase.from("entries").delete().eq("id", entry.id);
    if (error) {
      setMessage({ type: "error", text: `Không xoá được: ${error.message}` });
      return;
    }
    if (rows?.length) await supabase.storage.from("media").remove(rows.map((r: { path: string }) => r.path));
    await revalidateSite();
    router.replace("/viet");
  }

  const isPublished = entry?.status === "published";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      {/* ----- Cột soạn thảo ----- */}
      <div className="min-w-0">
        <label className="sr-only" htmlFor="title">
          Tiêu đề
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề trang nhật ký"
          maxLength={200}
          className="w-full border-0 bg-transparent font-display text-[clamp(2rem,5vw,3.2rem)] leading-tight font-extrabold tracking-tight outline-none placeholder:text-ink/25"
        />

        <div className="sticker mt-5 overflow-hidden">
          <Toolbar editor={editor} onPickFiles={() => fileRef.current?.click()} onYoutube={addYoutube} />
          <div className="px-5 py-6 sm:px-8">
            <EditorContent editor={editor} />
          </div>
          {uploading > 0 && (
            <div className="border-t-2 border-ink bg-sun px-4 py-2 font-mono text-xs font-bold" role="status">
              Đang tải {uploading} tệp lên…
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          Mẹo: kéo thả hoặc dán ảnh/video thẳng vào khung soạn thảo. Ảnh được tự nén; video tối đa 50 MB.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void handleFiles(files);
          }}
        />
      </div>

      {/* ----- Cột thông tin ----- */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <div className="sticker flex flex-col gap-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Ngày</span>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (!entry) setPhaseId(phaseForDate(phases, e.target.value));
              }}
              className="w-full rounded-[10px] border-2 border-ink bg-card px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Giai đoạn</span>
            <select
              value={phaseId}
              onChange={(e) => setPhaseId(e.target.value)}
              className="w-full rounded-[10px] border-2 border-ink bg-card px-3 py-2 text-sm"
            >
              <option value="">(Không thuộc giai đoạn nào)</option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Thẻ</legend>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => {
                const on = tags.includes(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTags((cur) => (on ? cur.filter((x) => x !== t.value) : [...cur, t.value]))}
                    className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-ink px-2 py-1 text-xs font-semibold aria-pressed:bg-ink aria-pressed:text-paper"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-[3px] border-[1.5px] border-ink"
                      style={{ background: t.color }}
                    />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={`rounded-[10px] border-2 border-ink px-3.5 py-2.5 text-sm font-semibold ${
              message.type === "error" ? "bg-[#fde3df]" : "bg-mint"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => save("published")}
            disabled={!!saving || !editor}
            className="sticker press bg-grass px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {saving === "published" ? "Đang đăng…" : isPublished ? "Cập nhật bài đã đăng" : "Đăng nhật ký"}
          </button>
          <button
            type="button"
            onClick={() => save("draft")}
            disabled={!!saving || !editor}
            className="sticker press px-5 py-2.5 font-bold disabled:opacity-60"
          >
            {saving === "draft" ? "Đang lưu…" : isPublished ? "Chuyển về nháp" : "Lưu nháp"}
          </button>
          {entry && (
            <button
              type="button"
              onClick={remove}
              className="mt-2 text-sm font-semibold text-tomato underline-offset-2 hover:underline"
            >
              Xoá bài này
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function Btn({
  on,
  label,
  onClick,
  children,
}: {
  on?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      className="grid h-8 min-w-8 place-items-center rounded-md px-2 text-sm font-bold hover:bg-mint aria-pressed:bg-ink aria-pressed:text-paper"
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onPickFiles,
  onYoutube,
}: {
  editor: Editor | null;
  onPickFiles: () => void;
  onYoutube: () => void;
}) {
  const s =
    useEditorState({
      editor,
      selector: ({ editor: e }) => ({
        bold: e?.isActive("bold") ?? false,
        italic: e?.isActive("italic") ?? false,
        h2: e?.isActive("heading", { level: 2 }) ?? false,
        h3: e?.isActive("heading", { level: 3 }) ?? false,
        bullet: e?.isActive("bulletList") ?? false,
        ordered: e?.isActive("orderedList") ?? false,
        quote: e?.isActive("blockquote") ?? false,
        link: e?.isActive("link") ?? false,
      }),
    }) ?? { bold: false, italic: false, h2: false, h3: false, bullet: false, ordered: false, quote: false, link: false };
  if (!editor) return <div className="h-12 border-b-2 border-ink bg-paper" />;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Dán đường dẫn (để trống để bỏ link):", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b-2 border-ink bg-paper px-2 py-2">
      <Btn label="Đậm" on={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </Btn>
      <Btn label="Nghiêng" on={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </Btn>
      <span className="mx-1 h-5 w-0.5 bg-ink/20" />
      <Btn label="Tiêu đề lớn" on={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn label="Tiêu đề nhỏ" on={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Btn>
      <Btn label="Danh sách" on={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • —
      </Btn>
      <Btn label="Danh sách đánh số" on={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </Btn>
      <Btn label="Trích dẫn" on={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        “ ”
      </Btn>
      <Btn label="Đường dẫn" on={s.link} onClick={setLink}>
        Link
      </Btn>
      <Btn label="Đường kẻ ngăn" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ···
      </Btn>
      <span className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onPickFiles}
          className="sticker-sm bg-mint px-3 py-1 text-sm font-bold hover:bg-card"
        >
          + Ảnh / video
        </button>
        <button type="button" onClick={onYoutube} className="sticker-sm bg-card px-3 py-1 text-sm font-bold hover:bg-mint">
          + YouTube
        </button>
      </span>
    </div>
  );
}
