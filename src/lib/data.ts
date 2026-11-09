import "server-only";
import { createPublicClient } from "./supabase/public";
import { ENTRY_CARD_FIELDS, type Entry, type EntryCard, type MediaItem, type Phase } from "./types";

export async function getPhases(): Promise<Phase[]> {
  const { data, error } = await createPublicClient()
    .from("phases")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPhaseBySlug(slug: string): Promise<Phase | null> {
  const { data } = await createPublicClient().from("phases").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getPublishedEntries(opts: { phaseId?: string } = {}): Promise<EntryCard[]> {
  let q = createPublicClient()
    .from("entries")
    .select(ENTRY_CARD_FIELDS)
    .eq("status", "published")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (opts.phaseId) q = q.eq("phase_id", opts.phaseId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as EntryCard[];
}

export async function getEntryBySlug(slug: string): Promise<Entry | null> {
  const { data } = await createPublicClient()
    .from("entries")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as Entry | null;
}

/** Bài liền trước / liền sau theo ngày để điều hướng cuối bài. */
export async function getNeighbours(entry: Pick<Entry, "entry_date" | "created_at" | "id">) {
  const sb = createPublicClient();
  const [older, newer] = await Promise.all([
    sb
      .from("entries")
      .select("slug, title, entry_date")
      .eq("status", "published")
      .lte("entry_date", entry.entry_date)
      .neq("id", entry.id)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from("entries")
      .select("slug, title, entry_date")
      .eq("status", "published")
      .gte("entry_date", entry.entry_date)
      .neq("id", entry.id)
      .order("entry_date", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return { older: older.data, newer: newer.data };
}

export type GalleryItem = MediaItem & {
  entry: { slug: string; title: string; entry_date: string } | null;
};

export async function getGallery(): Promise<GalleryItem[]> {
  const { data, error } = await createPublicClient()
    .from("media")
    .select("id, entry_id, kind, path, width, height, caption, entry:entries!inner(slug, title, entry_date, status)")
    .eq("entry.status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as GalleryItem[];
}
