"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { BusinessList } from "@/components/business-list";
import { BusinessMap } from "@/components/business-map";
import { createClient } from "@/lib/supabase/client";
import { type Tables } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { EmptySearch } from "@/components/ui/empty-search";
import { useGeolocation } from "@/hooks/use-geolocation";

export default function Home() {
  const [reports, setReports] = useState<
    (Tables<"reports"> & { business: Tables<"businesses"> | null })[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const supabase = createClient();

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*, business:businesses(*)");
      if (!error && data) {
        setReports(data);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) =>
    report.business?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-96 border-r bg-background flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredReports.length === 0 && searchTerm ? (
              <EmptySearch searchTerm={searchTerm} />
            ) : (
              <BusinessList reports={filteredReports} />
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1">
          <BusinessMap
            reports={filteredReports}
            center={
              latitude && longitude
                ? { lat: latitude, lng: longitude }
                : undefined
            }
          />
        </div>
      </div>
    </main>
  );
}
