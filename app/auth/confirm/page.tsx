"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // If we have a redirectTo parameter and the user is authenticated,
          // redirect them to that page
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            router.push("/");
          }
        } else {
          // If no session, redirect to sign-in
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [supabase.auth, router, redirectTo]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Confirming your authentication
        </h1>
        <p className="text-gray-600">
          Please wait while we verify your session...
        </p>
      </div>
    </div>
  );
}
