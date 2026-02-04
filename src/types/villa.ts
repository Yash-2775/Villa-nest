export interface MediaItem {
  type: "image" | "video";
  url: string;
}

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface Villa {
  id: string;

  name?: string;
  type?: string;
  description?: string | null;
  location?: string;

  // 🔥 IMPORTANT: match Firestore naming
  pricePerNight?: number;
  price_hourly?: number | null;

  amenities?: string[];

  main_image_url?: string | null;
  media_gallery?: MediaItem[] | null;
  map_coordinates?: MapCoordinates | null;

  avg_rating?: number | null;
  createdAt?: any;
}