import { useState } from "react";

type SearchResult = {
  place_name: string;
  properties: {
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
  center: [number, number];
};

export function useMapboxSearch() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const clearResults = () => {
    setSearchResults([]);
  };

  const searchAddress = async (query: string, country?: "US" | "CA") => {
    if (!query) return;

    setIsSearching(true);
    try {
      const countryCode = country ? `&country=${country}` : "";
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }&types=poi${countryCode}&permanent=false`
      );

      const data = await response.json();
      setSearchResults(
        data.features.map((feature: any) => ({
          place_name: feature.place_name,
          properties: {
            address: feature.properties?.address,
            city: feature.context?.find((c: any) => c.id.includes("place"))
              ?.text,
            state: feature.context?.find((c: any) => c.id.includes("region"))
              ?.text,
            postcode: feature.context?.find((c: any) =>
              c.id.includes("postcode")
            )?.text,
          },
          center: feature.center,
        }))
      );
    } catch (error) {
      console.error("Error searching address:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return { searchAddress, searchResults, isSearching, clearResults };
}
