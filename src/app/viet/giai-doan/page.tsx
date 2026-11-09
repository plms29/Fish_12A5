import { createSessionClient } from "@/lib/supabase/server";
import type { Phase } from "@/lib/types";
import { PhaseManager } from "./phase-manager";

export default async function StudioPhasesPage() {
  const supabase = await createSessionClient();
  const { data } = await supabase.from("phases").select("*").order("sort_order");
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Giai đoạn của bể</h1>
      <p className="mt-1 max-w-2xl text-ink-soft">
        Mỗi khi bể đổi cư dân (thêm loài mới, chuyển bể…), hãy kết thúc giai đoạn cũ và mở giai đoạn mới. Bài viết
        mới sẽ tự gắn vào giai đoạn đang diễn ra theo ngày.
      </p>
      <PhaseManager initial={(data ?? []) as Phase[]} />
    </>
  );
}
