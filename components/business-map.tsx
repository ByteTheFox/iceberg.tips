"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Tables } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BusinessMapProps {
  businesses: Tables<"business_stats">[] | null;
  center?: { lat: number; lng: number };
}

export function BusinessMap({ businesses, center }: BusinessMapProps) {
  const [selectedBusiness, setSelectedBusiness] =
    useState<Tables<"business_stats"> | null>(null);
  const mapRef = useRef<MapRef>(null);
  const [viewport, setViewport] = useState({
    latitude: center?.lat || 40.7128,
    longitude: center?.lng || -74.006,
    zoom: 12,
  });

  const requestLocation = async () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    try {
      // First check/request permission
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permission.state === "denied") {
        toast.error("Please enable location access in your browser settings");
        return;
      }

      // Get position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewport((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoom: 11,
          }));
          toast.success("Location updated");
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error("Location permission denied");
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error("Location information unavailable");
              break;
            case error.TIMEOUT:
              toast.error("Location request timed out");
              break;
            default:
              toast.error("An error occurred getting your location");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      toast.error("Error accessing location");
      console.error(error);
    }
  };

  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.flyTo({
        center: [center.lng, center.lat],
        duration: 2000,
      });
    }
  }, [center]);

  return (
    <Map
      ref={mapRef}
      {...viewport}
      onMove={(evt) => setViewport(evt.viewState)}
      style={{ width: "100%", height: "100%", position: "relative" }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      reuseMaps
    >
      <NavigationControl position="top-right" />

      <div className="absolute top-2 left-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={requestLocation}
          className="shadow-md"
        >
          Use My Location
        </Button>
      </div>

      {businesses?.map((business) => (
        <Marker
          key={business.id}
          latitude={business.latitude ?? 0}
          longitude={business.longitude ?? 0}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedBusiness(business);
          }}
        >
          <div className="cursor-pointer transform transition-transform hover:scale-110">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs shadow-lg">
              $
            </div>
          </div>
        </Marker>
      ))}

      {selectedBusiness && (
        <Popup
          latitude={selectedBusiness.latitude ?? 0}
          longitude={selectedBusiness.longitude ?? 0}
          onClose={() => setSelectedBusiness(null)}
          closeButton={true}
          closeOnClick={false}
          offset={25}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base">
                {selectedBusiness.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <p className="text-sm text-muted-foreground mb-2">
                {selectedBusiness.address}, {selectedBusiness.city}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={`
                    ${
                      selectedBusiness.computed_tips_go_to_staff === true
                        ? "bg-green-100 text-green-800 border-green-200"
                        : ""
                    }
                    ${
                      selectedBusiness.computed_tips_go_to_staff === false
                        ? "bg-red-100 text-red-800 border-red-200"
                        : ""
                    }
                    ${
                      selectedBusiness.computed_tips_go_to_staff === null
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : ""
                    }
                  `}
                >
                  {selectedBusiness.computed_tips_go_to_staff === null
                    ? "UNKNOWN"
                    : selectedBusiness.computed_tips_go_to_staff
                    ? "TIPS GO TO STAFF"
                    : "TIPS DON'T GO TO STAFF"}
                </Badge>

                <Badge
                  variant="outline"
                  className={`
                      ${
                        selectedBusiness.computed_tip_practice ===
                        "tip_requested"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : ""
                      }
                      ${
                        selectedBusiness.computed_tip_practice ===
                        "mandatory_service_charge"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : ""
                      }
                      ${
                        selectedBusiness.computed_tip_practice === null
                          ? "bg-gray-100 text-gray-800 border-gray-200"
                          : ""
                      }
                    `}
                >
                  {selectedBusiness.computed_tip_practice
                    ? selectedBusiness.computed_tip_practice
                        .replace("_", " ")
                        .toUpperCase()
                    : "UNKNOWN"}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {selectedBusiness.computed_suggested_tips &&
                  selectedBusiness.computed_suggested_tips?.length > 0 && (
                    <p>
                      Suggested Tips:{" "}
                      {selectedBusiness.computed_suggested_tips
                        .map((tip) => `${tip}%`)
                        .join(", ")
                        .replace(/,([^,]*)$/, ", and$1")}
                    </p>
                  )}
                {(selectedBusiness.computed_service_charge_percentage ?? 0) >
                  0 && (
                  <p>
                    Service Charge:{" "}
                    {selectedBusiness.computed_service_charge_percentage}%
                  </p>
                )}
                <p>Reports: {selectedBusiness.report_count}</p>
              </div>
            </CardContent>
          </Card>
        </Popup>
      )}
    </Map>
  );
}
