import { requireEditor } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { SettingsForms } from "./settings-forms";

export default async function SettingsPage() {
  const viewer = await requireEditor();
  const supabase = await createSessionClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", "invite_code").maybeSingle();
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Cài đặt</h1>
      <SettingsForms name={viewer.displayName} invite={data?.value ?? ""} />
    </>
  );
}
