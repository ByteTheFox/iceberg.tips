"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { GeocodingResult } from "@/utils/geocoding";

export function LocationSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${
            process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          }&types=place,postcode,address&limit=5`
        );
        const data = await response.json();
        setSuggestions(
          data.features.map((feature: any) => ({
            center: feature.center,
            place_name: feature.place_name,
          }))
        );
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > -1 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else {
          handleSubmit(e as any);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?location=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: GeocodingResult) => {
    setQuery(suggestion.place_name);
    router.push(
      `/search?location=${encodeURIComponent(suggestion.place_name)}`
    );
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <div className="relative" ref={dropdownRef}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by city, state, or zip code"
          className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md border border-gray-200 shadow-lg">
            {isLoading ? (
              <div className="p-2 text-sm text-gray-500">Loading...</div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full text-left px-4 py-2 text-sm focus:outline-none ${
                    highlightedIndex === index
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {suggestion.place_name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </form>
  );
}
