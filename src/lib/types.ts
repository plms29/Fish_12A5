export type Phase = {
  id: string;
  slug: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  cover_path: string | null;
  sort_order: number;
};

export type EntryStatus = "draft" | "published";

export type Entry = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_json: unknown;
  content_html: string;
  entry_date: string;
  phase_id: string | null;
  tags: string[];
  cover_path: string | null;
  status: EntryStatus;
  author_id: string | null;
  author_name: string;
  created_at: string;
  updated_at: string;
};

export type EntryCard = Pick<
  Entry,
  "id" | "slug" | "title" | "excerpt" | "entry_date" | "phase_id" | "tags" | "cover_path" | "author_name"
>;

export type MediaItem = {
  id: string;
  entry_id: string | null;
  kind: "image" | "video";
  path: string;
  width: number | null;
  height: number | null;
  caption: string;
};

export const ENTRY_CARD_FIELDS =
  "id, slug, title, excerpt, entry_date, phase_id, tags, cover_path, author_name";
