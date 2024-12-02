import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { LocationSearch } from "@/components/LocationSearch";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="w-full max-w-screen-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center font-bold text-xl">
            Iceberg
          </Link>
        </div>
        <div className="flex-1 max-w-md">
          <LocationSearch />
        </div>
        <Link href="/report">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report a business
          </Button>
        </Link>
      </div>
    </header>
  );
}
