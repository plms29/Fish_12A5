import { createClient } from "@supabase/supabase-js";

/**
 * Client chỉ-đọc cho các trang công khai. Không đọc cookie nên trang
 * có thể được cache (ISR). RLS chỉ trả về bài đã đăng.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
