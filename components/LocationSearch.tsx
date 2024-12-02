"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function LocationSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?location=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, state, or zip code"
          className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </form>
  );
}
