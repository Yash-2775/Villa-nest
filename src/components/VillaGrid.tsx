import { useEffect, useState, useMemo } from "react";

import VillaCard from "./VillaCard";
import VillaFilters from "./VillaFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";
import type { Villa } from "@/types/villa";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore";

const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-icons-outlined ${className}`}>{name}</span>
);

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
    <section id="properties" className="py-32 bg-background relative overflow-hidden Grainy border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-20">
        <div className="text-center space-y-6">
          <Badge variant="outline" className="px-6 py-2 border-black/5 text-foreground/60 rounded-full text-[10px] font-black tracking-[0.3em] uppercase bg-secondary/50 shadow-sm">
            Our Best Villas
          </Badge>
          <h2 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-none">
            Selected <span className="text-accent italic font-serif">Villas</span>
          </h2>
          <p className="text-foreground/50 text-xl font-light tracking-wide max-w-2xl mx-auto">
            Beautiful homes hand-picked for your perfect holiday.
          </p>
        </div>

        <div className="bg-secondary p-6 rounded-2xl border border-black/5 shadow-sm">
          <VillaFilters
            allVillas={allVillas}
            onFilter={setFilteredVillas}
          />
        </div>

        {finalVillas.length === 0 ? (
          <div className="py-32 text-center space-y-8 bg-secondary rounded-2xl border border-black/5 shadow-sm">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-accent/20">⌘</span>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold text-foreground/80 tracking-tight">
                No villas matching your criteria.
              </p>
              <Button
                variant="outline"
                className="rounded-full px-10 h-14 border-black/10 hover:bg-background transition-all font-black uppercase tracking-widest text-[9px]"
                onClick={() => window.location.reload()}
              >
                Reset all criteria
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-12">
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
