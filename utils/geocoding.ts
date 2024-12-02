const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface GeocodingResult {
  center: [number, number]; // [longitude, latitude]
  place_name: string;
}

export async function geocodeLocation(
  location: string
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${MAPBOX_API_KEY}&types=place,postcode,address&limit=1`
    );

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        center: feature.center,
        place_name: feature.place_name,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
