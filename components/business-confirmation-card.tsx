import Image from "next/image";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Initialize mapbox with access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface BusinessConfirmationCardProps {
  business: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    photo?: string;
  };
}

export default function BusinessConfirmationCard({
  business,
}: BusinessConfirmationCardProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [business.longitude, business.latitude],
      zoom: 15,
    });

    // Add marker
    marker.current = new mapboxgl.Marker()
      .setLngLat([business.longitude, business.latitude])
      .addTo(map.current);

    // Cleanup
    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [business.latitude, business.longitude]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex gap-6">
          {business.photo && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
              <Image
                src={business.photo}
                alt={business.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{business.name}</h3>
            <div className="flex items-start gap-2 mt-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-1 shrink-0" />
              <div>
                <p>{business.address}</p>
                <p>{`${business.city}, ${business.state} ${business.zipCode}`}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full h-[200px] rounded-lg overflow-hidden">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
}
