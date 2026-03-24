import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 로그인하지 않은 사용자가 보호된 페이지에 접근하면 로그인으로 리다이렉트
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/schedules") ||
    pathname.startsWith("/groups") ||
    pathname.startsWith("/friends") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin");

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 관리자 페이지 접근 권한 체크
  if (user && pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "member";
    if (role !== "master" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 이미 로그인한 사용자가 로그인 페이지에 접근하면 대시보드로 리다이렉트
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
