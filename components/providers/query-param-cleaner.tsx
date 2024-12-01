"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function QueryParamCleaner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If there's a 'code' parameter, remove it from the URL without a page refresh
    if (searchParams.has("code")) {
      window.history.replaceState({}, "", pathname);
    }
  }, [pathname, searchParams]);

  return null;
}
