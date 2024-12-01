import { SearchX } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

export function EmptySearch({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
      <p className="text-muted-foreground mb-4">
        We couldn't find any businesses matching "{searchTerm}"
      </p>
      <Link href="/report">
        <Button>Submit a new business report</Button>
      </Link>
    </div>
  );
}
