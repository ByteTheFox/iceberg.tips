import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BusinessUI from "@/components/business-ui";

export default async function Home() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*, business:businesses(*)");

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-full px-4 mx-auto h-full flex items-center justify-between">
          <h1 className="text-xl font-bold">Iceberg</h1>
          <Link href="/report">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Report a business
            </Button>
          </Link>
        </div>
      </div>

      <BusinessUI reports={reports} />
    </main>
  );
}
