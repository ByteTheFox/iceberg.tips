import useSWR from "swr";
import { supabase } from "@/lib/supabase";

export function useBusinesses(latitude: number, longitude: number) {
  const {
    data: businesses,
    error,
    isLoading,
  } = useSWR(
    [`businesses-${latitude}-${longitude}`, latitude, longitude],
    async ([, lat, lng]) => {
      // You might want to adjust the distance (5000 meters = 5km) based on your needs
      const { data, error } = await supabase.rpc("nearby_businesses", {
        latitude: lat,
        longitude: lng,
        distance_meters: 5000,
      });

      if (error) throw error;
      return data;
    }
  );

  return {
    businesses,
    isLoading,
    error,
  };
}
