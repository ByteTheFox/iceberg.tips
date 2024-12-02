import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <div className="h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="max-w-full px-4 mx-auto h-full flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Iceberg
        </Link>
        <Link href="/report">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report a business
          </Button>
        </Link>
      </div>
    </div>
  );
}
