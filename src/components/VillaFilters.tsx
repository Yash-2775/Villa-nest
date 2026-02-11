import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

import {
  Search,
  MapPin,
  Home,
  Filter,
  IndianRupee,
  CheckSquare,
} from "lucide-react";

import type { Villa } from "@/types/villa";

interface VillaFiltersProps {
  onFilter: (filteredVillas: Villa[]) => void;
  allVillas: Villa[];
}

const VillaFilters = ({ onFilter, allVillas }: VillaFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const locations = [...new Set(allVillas.map((v) => v.location))];
  const types = [...new Set(allVillas.map((v) => v.type))];
  const maxPrice = Math.max(...allVillas.map((v) => v.price_per_night), 30000);

  const allAmenities = Array.from(
    new Set(allVillas.flatMap((v) => v.amenities ?? []))
  );

  useEffect(() => {
    applyFilters();
  }, [
    searchQuery,
    selectedType,
    selectedLocation,
    priceRange,
    selectedAmenities,
    allVillas,
  ]);

  const applyFilters = () => {
    let filtered = [...allVillas];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.location.toLowerCase().includes(query) ||
          v.amenities?.some((a) => a.toLowerCase().includes(query))
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((v) => v.type === selectedType);
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter((v) => v.location === selectedLocation);
    }

    filtered = filtered.filter(
      (v) =>
        v.price_per_night >= priceRange[0] &&
        v.price_per_night <= priceRange[1]
    );

    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((v) =>
        selectedAmenities.every((a) => v.amenities?.includes(a))
      );
    }

    onFilter(filtered);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="space-y-6">
      {/* SEARCH */}
      <div className="flex items-center gap-3 bg-white border rounded-2xl p-3">
        <Search className="text-muted-foreground" />
        <Input
          placeholder="Search by location, name, amenities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 focus-visible:ring-0"
        />
      </div>

      {/* FILTER BAR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-6">
          {/* Location */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-medium uppercase text-gray-400 flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-sm text-gray-800 bg-transparent focus:outline-none"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-medium uppercase text-gray-400 flex items-center gap-1 mb-1">
              <Home className="w-3.5 h-3.5" />
              Property Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-sm text-gray-800 bg-transparent focus:outline-none"
            >
              <option value="all">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex-1 min-w-[220px]">
            <label className="text-[10px] font-medium uppercase text-gray-400 flex items-center gap-1 mb-1">
              <IndianRupee className="w-3.5 h-3.5" />
              Price Range
            </label>
            <Slider
              value={priceRange}
              min={0}
              max={maxPrice}
              step={1000}
              onValueChange={(v) => setPriceRange(v as [number, number])}
              className="mb-1"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}+</span>
            </div>
          </div>

          {/* More Filters */}
          <div className="flex items-center gap-2 cursor-pointer text-sm text-emerald-600 font-medium select-none">
            <Filter className="w-5 h-5" />
            <button onClick={() => setShowFilters(true)} className="hover:underline">
              More Filters
            </button>
          </div>
        </div>

      {/* FILTER MODAL */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-8 py-6 border-b">
              <h3 className="text-xl font-semibold">More Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="px-8 py-8 space-y-10">

              {/* POPULAR AMENITIES */}
              <div>
                <h4 className="text-xs font-bold tracking-widest text-muted-foreground mb-6">
                  POPULAR AMENITIES
                </h4>

                <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                  {allAmenities.map((amenity) => {
                    const active = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className="flex items-center gap-4 text-left"
                      >
                        {/* Circle */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition
                            ${
                              active
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-slate-300"
                            }`}
                        >
                          {active && "✓"}
                        </span>

                        <span className="text-sm font-medium text-slate-700">
                          {amenity}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STAY DURATION (UI ONLY) */}
              <div>
                <h4 className="text-xs font-bold tracking-widest text-muted-foreground mb-6">
                  STAY DURATION
                </h4>

                <div className="flex gap-4">
                  <button className="px-6 py-3 rounded-full border text-sm font-semibold">
                    Short Stay (1–3 nights)
                  </button>

                  <button className="px-6 py-3 rounded-full border border-emerald-500 text-emerald-600 bg-emerald-50 text-sm font-semibold">
                    Extended Stay (7+ nights)
                  </button>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between px-8 py-6 bg-slate-50 border-t">
              <button
                onClick={() => setSelectedAmenities([])}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                Reset All
              </button>

              <button
                onClick={() => setShowFilters(false)}
                className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
     )}

    </div>
  );
};

export default VillaFilters;
