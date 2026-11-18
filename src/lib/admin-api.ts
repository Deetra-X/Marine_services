import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase-server";

export async function requireAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      }
    }
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();
  if (!service) return null;
  const { data: admin } = await service
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  return admin ? { user, service } : null;
}
