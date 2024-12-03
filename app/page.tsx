import { createClient } from "@/lib/supabase/server";
import BusinessUI from "@/components/business-ui";
import { type SearchParams } from "@/lib/types";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  // Get location parameters
  const sp = await searchParams;
  const lat = sp?.lat ? parseFloat(sp.lat) : undefined;
  const lng = sp?.lng ? parseFloat(sp.lng) : undefined;

  // If we have coordinates, we can use PostGIS to find nearby businesses
  let query = supabase.from("business_stats").select("*");

  if (lat && lng) {
    // Add location-based filtering if coordinates are provided
    // Assuming your business_stats table has lat and lng columns
    query = query
      .filter("latitude", "gte", lat - 0.1)
      .filter("latitude", "lte", lat + 0.1)
      .filter("longitude", "gte", lng - 0.1)
      .filter("longitude", "lte", lng + 0.1);
  }

  const { data: businesses } = await query;

  return (
    <BusinessUI businesses={businesses} initialLat={lat} initialLng={lng} />
  );
}
