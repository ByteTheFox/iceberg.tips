import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw error;
      }

      // Get the session to ensure it's established
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No session established");
      }
    }

    // Create a clean URL without any query parameters
    const redirectUrl = new URL("/", requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}
