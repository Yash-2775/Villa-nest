import { useEffect, useState, useMemo } from "react";

import VillaCard from "./VillaCard";
import VillaFilters from "./VillaFilters";

import { Skeleton } from "@/components/ui/skeleton";
import type { Villa } from "@/types/villa";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore";

const VillaGrid = () => {
  const [allVillas, setAllVillas] = useState<Villa[]>([]);
  const [filteredVillas, setFilteredVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "villas"));

        const villas: Villa[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();

            if (data.is_active === false) return null;

            return {
              id: doc.id,
              name: data.name ?? "Unnamed Villa",
              location: data.location ?? "Unknown location",
              price_per_night: Number(
                data.pricePerNight ?? data.price_per_night ?? 0
              ),
              price_hourly: null,
              maxGuests: Number(data.maxGuests ?? 0),
              type: "Villa",
              amenities: data.amenities ?? [],
              main_image_url: data.main_image_url ?? null,
              media_gallery: null,
              map_coordinates: null,
              avg_rating:
                typeof data.avg_rating === "number" ? data.avg_rating : null,
              created_at: new Date().toISOString(),
              description: null,
            };
          })
          .filter(Boolean) as Villa[];

        setAllVillas(villas);
        setFilteredVillas(villas);
      } catch (error) {
        console.error("Failed to fetch villas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVillas();
  }, []);

  /* ✅ Filters already applied in VillaFilters */
  const finalVillas = useMemo(() => {
    return filteredVillas;
  }, [filteredVillas]);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="properties" className="py-20">
      <div className="container mx-auto px-4 space-y-6">
        <VillaFilters
          allVillas={allVillas}
          onFilter={setFilteredVillas}
        />

        {finalVillas.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">
            No villas found.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {finalVillas.map((villa, index) => (
              <VillaCard
                key={villa.id}
                villa={villa}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VillaGrid;
