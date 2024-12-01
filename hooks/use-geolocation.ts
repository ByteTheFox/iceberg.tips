import { useState, useEffect } from "react";
import { getServerLocation } from "@/utils/geolocation";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  source?: "server" | "client" | "fallback";
}

const defaultLocation = {
  latitude: 40.7128,
  longitude: -74.006,
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    async function detectLocation() {
      // First try server-side detection
      try {
        const serverLocation = await getServerLocation();

        if (!serverLocation.error) {
          setState({
            latitude: serverLocation.latitude,
            longitude: serverLocation.longitude,
            error: null,
            loading: false,
            source: "server",
          });
          return;
        }
      } catch (error) {
        // Continue to client-side detection if server fails
      }

      // Fall back to client-side detection
      if (!navigator.geolocation) {
        setState((prev) => ({
          ...prev,
          error: "Geolocation is not supported",
          loading: false,
          source: "fallback",
          ...defaultLocation,
        }));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            loading: false,
            source: "client",
          });
        },
        (error) => {
          setState((prev) => ({
            ...prev,
            error: error.message,
            loading: false,
            source: "fallback",
            ...defaultLocation,
          }));
        }
      );
    }

    detectLocation();
  }, []);

  return state;
}
