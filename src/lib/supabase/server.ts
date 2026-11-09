import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client theo phiên đăng nhập, dùng trong Server Component / Server Action. */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Gọi từ Server Component: proxy.ts sẽ làm mới cookie.
          }
        },
      },
    },
  );
}
