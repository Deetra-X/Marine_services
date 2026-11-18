import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    const login = NextResponse.redirect(new URL("/admin/login", request.url));
    login.cookies.delete("sb-access-token");
    return login;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.redirect(new URL("/admin/login?error=configuration", request.url));
  }

  const { createClient } = await import("@supabase/supabase-js");
  const service = createClient(url, serviceKey);
  const { data: admin } = await service
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!admin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};
