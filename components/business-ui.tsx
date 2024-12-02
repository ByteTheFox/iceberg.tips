"use client";

import { Tables } from "@/lib/types";
import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { BusinessList } from "./business-list";
import { BusinessMap } from "./business-map";
import { EmptySearch } from "./ui/empty-search";
import { useGeolocation } from "@/hooks/use-geolocation";

export default function BusinessUI({
  businesses,
}: {
  businesses: Tables<"business_stats">[] | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { latitude, longitude } = useGeolocation();

  const filteredBusinesses = businesses?.filter((business) =>
    business.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
          {filteredBusinesses?.length === 0 && searchTerm ? (
            <EmptySearch searchTerm={searchTerm} />
          ) : (
            <BusinessList businesses={filteredBusinesses || null} />
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <BusinessMap
          businesses={filteredBusinesses || null}
          center={
            latitude && longitude
              ? { lat: latitude, lng: longitude }
              : undefined
          }
        />
      </div>
    </div>
  );
}
