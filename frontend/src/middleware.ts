import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const supabaseAdmin = createServiceRoleClient();
  const path = request.nextUrl.pathname;

  // --- ADMIN AREA PROTECTION ---
  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  if (isAdminRoute) {
    // Check Supabase Auth for admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("role", "admin");
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    // Verify admin status and role
    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("role")
      .eq("email", user.email)
      .single();

    if (!admin || admin.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("role", "admin");
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  // --- USER AREA PROTECTION ---
  const protectedRoutes = ["/video", "/category"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check custom session cookie first (for regular users)
    const customSession = request.cookies.get("custom_session");

    if (customSession) {
      try {
        const session = JSON.parse(customSession.value);

        // Check if session is expired
        if (session.expires_at < Date.now()) {
          const url = request.nextUrl.clone();
          url.pathname = "/auth/signin";
          url.searchParams.set("redirect", path);
          return NextResponse.redirect(url);
        }

        // Valid user session
        if (session.user.role === "user") {
          return response;
        }
      } catch (error) {
        console.error("Session parse error:", error);
      }
    }

    // Also check Supabase Auth (for admin access to user areas)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: admin } = await supabaseAdmin
        .from("admins")
        .select("role")
        .eq("email", user.email)
        .single();

      // Allow admins to access user areas
      if (admin && admin.role === "admin") {
        return response;
      }
    }

    // No valid session found
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/video/:path*", "/category/:path*"],
};
