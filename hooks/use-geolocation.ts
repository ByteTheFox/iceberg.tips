import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

const defaultLocation = {
  latitude: 40.7128, // New York City coordinates as fallback
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
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported",
        loading: false,
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
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
          ...defaultLocation,
        }));
      }
    );
  }, []);

  return state;
}
