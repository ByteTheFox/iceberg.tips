"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { ToggleViews } from "@/components/ui/toggle-views";
import { BusinessList } from "@/components/business-list";
import { BusinessMap } from "@/components/business-map";
import { supabase } from "@/lib/supabase/client";
import { type BusinessReport } from "@/lib/types";

export default function Home() {
  const [activeView, setActiveView] = useState<"map" | "list">("map");
  const [reports, setReports] = useState<BusinessReport[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("business_reports")
        .select("*");
      if (!error && data) {
        setReports(data);
      }
    };
    fetchReports();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto h-full flex items-center justify-between">
          <h1 className="text-xl font-bold">Iceberg</h1>
          <div className="flex items-center gap-4">
            <ToggleViews activeView={activeView} onViewChange={setActiveView} />
            <Link href="/report">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Report Business
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6">
        {activeView === "map" ? (
          <div className="h-[calc(100vh-7rem)] rounded-lg border overflow-hidden">
            <BusinessMap reports={reports} />
          </div>
        ) : (
          <BusinessList reports={reports} />
        )}
      </div>
    </main>
  );
}
