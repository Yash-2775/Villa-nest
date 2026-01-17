import { useEffect, useState, useMemo } from "react";

import VillaCard from "./VillaCard";
import VillaFilters from "./VillaFilters";

import { Skeleton } from "@/components/ui/skeleton";
import type { Villa } from "@/types/villa";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore";

/* ================= NEW UI CONTROLS ================= */

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* =================================================== */

const VillaGrid = () => {
  /* ================= EXISTING STATE (UNCHANGED) ================= */

  const [allVillas, setAllVillas] = useState<Villa[]>([]);
  const [filteredVillas, setFilteredVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= NEW STATE (PHASE 25) ================= */

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  /* ============================================================ */

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "villas"));

        const villas: Villa[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();

            /* 🔒 PHASE 28: HIDE INACTIVE VILLAS */
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

              /* ✅ DO NOT FORCE avg_rating */
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

  /* ================= PHASE 25 LOGIC ================= */

  const finalVillas = useMemo(() => {
    let result = [...filteredVillas];

    /* 🔍 SEARCH */
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q)
      );
    }

    /* 💰 PRICE FILTER */
    if (maxPrice !== null) {
      result = result.filter((v) => v.price_per_night <= maxPrice);
    }

    /* 🧩 AMENITIES FILTER */
    if (selectedAmenities.length > 0) {
      result = result.filter((v) =>
        selectedAmenities.every((a) => v.amenities?.includes(a))
      );
    }

    /* ⭐ SORTING */
    result.sort((a, b) => {
      if (sortBy === "rating") {
        return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
      }
      return a.price_per_night - b.price_per_night;
    });

    return result;
  }, [filteredVillas, searchText, sortBy, maxPrice, selectedAmenities]);

  /* ================================================= */

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
        <VillaFilters allVillas={allVillas} onFilter={setFilteredVillas} />

        <div className="grid md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by name or location"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Max price"
            onChange={(e) =>
              setMaxPrice(e.target.value ? Number(e.target.value) : null)
            }
          />

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating (High → Low)</SelectItem>
              <SelectItem value="price">Price (Low → High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {finalVillas.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">
            No villas found.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {finalVillas.map((villa, index) => (
              <VillaCard key={villa.id} villa={villa} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VillaGrid;