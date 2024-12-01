import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session and get an up-to-date session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If accessing /report without a session, redirect to sign-in
  if (!session && req.nextUrl.pathname.startsWith("/report")) {
    const redirectUrl = new URL("/sign-in", req.url);
    // Encode the redirectTo parameter
    redirectUrl.searchParams.set(
      "redirectTo",
      encodeURIComponent(req.nextUrl.pathname)
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Create a new response with the session
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Refresh the auth cookies
  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: ["/report", "/report/:path*", "/auth/callback"],
};
