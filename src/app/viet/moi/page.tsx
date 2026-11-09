import { EntryEditor } from "@/components/editor/entry-editor";
import { requireEditor } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import type { Phase } from "@/lib/types";

export default async function NewEntryPage() {
  const viewer = await requireEditor();
  const supabase = await createSessionClient();
  const { data } = await supabase.from("phases").select("*").order("sort_order");
  return (
    <EntryEditor phases={(data ?? []) as Phase[]} author={{ id: viewer.id, name: viewer.displayName }} />
  );
}
