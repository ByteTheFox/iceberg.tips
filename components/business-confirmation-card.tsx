import Image from "next/image";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
        <div className="mt-4 w-full h-[200px] rounded-lg overflow-hidden bg-muted">
          {/* Add your map component here */}
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Map placeholder
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
