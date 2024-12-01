"use client";

import { useEffect, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Database } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BusinessReport = Database["public"]["Tables"]["business_reports"]["Row"];

interface BusinessMapProps {
  reports: BusinessReport[];
}

export function BusinessMap({ reports }: BusinessMapProps) {
  const [selectedReport, setSelectedReport] = useState<BusinessReport | null>(
    null
  );
  const [viewport, setViewport] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 11,
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

  return (
    <Map
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

      {reports.map((report) => (
        <Marker
          key={report.id}
          latitude={report.latitude}
          longitude={report.longitude}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedReport(report);
          }}
        >
          <div className="cursor-pointer transform transition-transform hover:scale-110">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs shadow-lg">
              $
            </div>
          </div>
        </Marker>
      ))}

      {selectedReport && (
        <Popup
          latitude={selectedReport.latitude}
          longitude={selectedReport.longitude}
          onClose={() => setSelectedReport(null)}
          closeButton={true}
          closeOnClick={false}
          className="w-72"
          offset={25}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-sm">
                {selectedReport.business_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <p className="text-xs text-muted-foreground mb-2">
                {selectedReport.address}, {selectedReport.city}
              </p>
              <Badge variant="outline">
                {selectedReport.tip_practice.replace("_", " ").toUpperCase()}
              </Badge>
              {selectedReport.details && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedReport.details}
                </p>
              )}
            </CardContent>
          </Card>
        </Popup>
      )}
    </Map>
  );
}
