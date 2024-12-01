import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./lib/supabase/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = await createClient();

  // Optional: Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // You can also add protected routes here
  const protectedRoutes = ["/report"];
  if (!session && protectedRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
