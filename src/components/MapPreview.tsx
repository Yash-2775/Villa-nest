import { MapPin } from "lucide-react";
import type { MapCoordinates } from "@/types/villa";

interface MapPreviewProps {
  coordinates: MapCoordinates;
  locationText: string;
}

const MapPreview = ({ coordinates, locationText }: MapPreviewProps) => {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.01}%2C${coordinates.lat - 0.01}%2C${coordinates.lng + 0.01}%2C${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`;
  
  const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-foreground">Location</h3>
        <a 
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <MapPin className="w-4 h-4" />
          Open in Maps
        </a>
      </div>
      
      <div className="rounded-xl overflow-hidden border border-border shadow-md">
        <iframe
          src={mapUrl}
          width="100%"
          height="300"
          className="border-0"
          loading="lazy"
          title={`Map showing ${locationText}`}
        />
      </div>
      
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        {locationText}
      </p>
    </div>
  );
};

export default MapPreview;
