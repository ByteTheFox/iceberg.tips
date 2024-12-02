import { useState, useCallback } from "react";

type SearchResult = {
  type: "Feature";
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  properties: {
    name: string;
    mapbox_id: string;
    feature_type: string;
    address: string;
    full_address: string;
    place_formatted: string;
    context: {
      country: {
        name: string;
        country_code: string;
        country_code_alpha_3: string;
      };
      region: {
        name: string;
        region_code: string;
        region_code_full: string;
      };
      postcode: {
        name: string;
      };
      place: {
        name: string;
      };
      neighborhood?: {
        name: string;
      };
      street?: {
        name: string;
      };
    };
    coordinates: {
      latitude: number;
      longitude: number;
      routable_points: Array<{
        name: string;
        latitude: number;
        longitude: number;
      }>;
    };
    maki: string;
    poi_category: string[];
    poi_category_ids: string[];
    external_ids?: {
      safegraph?: string;
      foursquare?: string;
    };
    metadata: Record<string, unknown>;
  };
};

// Helper function to generate a random session token
const generateSessionToken = () => {
  return crypto.randomUUID();
};

export function useMapboxSearch() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sessionToken, setSessionToken] = useState(generateSessionToken());

  const clearResults = useCallback(() => {
    setSearchResults([]);
    // Generate a new session token when results are cleared
    setSessionToken(generateSessionToken());
  }, []);

  const getCanadianRegion = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=region`
      );
      const data = await response.json();
      const region = data.features[0]?.text || "";
      return {
        name: region,
        region_code: region.substring(0, 2).toUpperCase(),
        region_code_full: `CA-${region.substring(0, 2).toUpperCase()}`,
      };
    } catch (error) {
      console.error("Error fetching Canadian region:", error);
      return null;
    }
  };

  const searchAddress = async (query: string, country?: "US" | "CA") => {
    if (!query) return;

    setIsSearching(true);
    try {
      const countryCode = country ? `&country=${country}` : "";
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          query
        )}&access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }&types=poi${countryCode}&limit=10&session_token=${sessionToken}`
      );

      const data = await response.json();

      if (data.suggestions?.length) {
        const detailsPromises = data.suggestions.map(
          async (suggestion: any) => {
            const detailsResponse = await fetch(
              `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&session_token=${sessionToken}`
            );
            const details = await detailsResponse.json();
            const feature = details.features[0];

            // If country is Canada and region is missing, fetch it using geocoding API
            if (
              country === "CA" &&
              (!feature.properties.context.region ||
                !feature.properties.context.region.name)
            ) {
              const regionData = await getCanadianRegion(
                feature.properties.coordinates.latitude,
                feature.properties.coordinates.longitude
              );

              if (regionData) {
                // Add the region to the feature
                feature.properties.context.region = regionData;

                // Update the full_address to include the correct region
                feature.properties.full_address = `${feature.properties.address}, ${feature.properties.context.place.name}, ${regionData.name} ${feature.properties.context.postcode.name}, ${feature.properties.context.country.name}`;
              }
            }

            return feature;
          }
        );

        const detailsResults = await Promise.all(detailsPromises);
        setSearchResults(detailsResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching address:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return { searchAddress, searchResults, isSearching, clearResults };
}
