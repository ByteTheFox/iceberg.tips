"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function HeaderWrapper() {
  const pathname = usePathname();
  const isSpecialPage =
    pathname.includes("/sign-in") || pathname.includes("/error");

  if (isSpecialPage) {
    return null;
  }

  return <Header />;
}
