import { createClient } from "@/lib/supabase/server";
import BusinessUI from "@/components/business-ui";
import { type SearchParams } from "@/lib/types";

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  // Get location parameters
  const lat = searchParams.lat ? parseFloat(searchParams.lat) : undefined;
  const lng = searchParams.lng ? parseFloat(searchParams.lng) : undefined;

  // If we have coordinates, we can use PostGIS to find nearby businesses
  let query = supabase.from("business_stats").select("*");

  if (lat && lng) {
    // Add location-based filtering if coordinates are provided
    // Assuming your business_stats table has lat and lng columns
    query = query
      .filter("lat", "gte", lat - 0.1)
      .filter("lat", "lte", lat + 0.1)
      .filter("lng", "gte", lng - 0.1)
      .filter("lng", "lte", lng + 0.1);
  }

  const { data: businesses } = await query;

  return (
    <BusinessUI businesses={businesses} initialLat={lat} initialLng={lng} />
  );
}
