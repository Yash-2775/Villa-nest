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
  const maxPrice = Math.max(...allVillas.map((v) => v.pricePerNight ?? 0), 30000);

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
        (v.pricePerNight ?? 0) >= priceRange[0] &&
        (v.pricePerNight ?? 0) <= priceRange[1]
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
    <div className="space-y-12">
      {/* UNIFIED SEARCH BAR */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 bg-foreground p-2 rounded-[3rem] shadow-2xl border border-white/10 group">
        <div className="flex-1 flex items-center gap-4 pl-6 w-full">
          <Search className="text-accent w-5 h-5" />
          <Input
            placeholder="Search for a villa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 text-lg font-medium placeholder:text-white/20 h-14 bg-transparent text-white w-full"
          />
        </div>

        <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

        <div className="flex items-center gap-0 w-full md:w-auto pr-2">
          <div className="relative w-full md:w-48">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="appearance-none bg-transparent border-0 h-14 px-10 pr-12 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none text-white/60 hover:text-white w-full"
            >
              <option value="all" className="bg-primary">Everywhere</option>
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-primary">{loc}</option>
              ))}
            </select>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-8 h-14 bg-accent hover:bg-accent-hover rounded-full transition-all text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      {/* FILTER MODAL */}
      {showFilters && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl animate-in fade-in duration-700 p-4">
          <div className="w-full max-w-2xl rounded-[3.5rem] glass-dark shadow-ShadowElegant overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500">

            {/* HEADER */}
            <div className="flex items-center justify-between px-12 py-10 border-b border-white/5 bg-white/5">
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white italic tracking-tighter">Filter Villas</h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Search Options</p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all group"
              >
                <span className="text-xl group-hover:rotate-90 transition-transform">✕</span>
              </button>
            </div>

            {/* BODY */}
            <div className="px-12 py-12 space-y-16 max-h-[60vh] overflow-y-auto grainy scrollbar-elegant">

              {/* PRICE RANGE */}
              <div className="space-y-10">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black tracking-[0.3em] text-accent uppercase">Price Range</h4>
                    <p className="text-xs text-white/20 italic font-light">Per evening</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white tracking-tighter">₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
                <Slider
                  value={priceRange}
                  min={0}
                  max={maxPrice}
                  step={1000}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  className="py-4"
                />
              </div>

              {/* POPULAR AMENITIES */}
              <div className="space-y-10">
                <h4 className="text-[10px] font-black tracking-[0.3em] text-accent uppercase">Essential Luxuries</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allAmenities.map((amenity) => {
                    const active = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center gap-5 p-6 rounded-[2rem] border transition-all duration-500 ${active
                          ? "bg-secondary border-accent/20 text-foreground shadow-2xl scale-[1.02]"
                          : "bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${active ? "bg-primary text-white" : "border border-white/10"}`}>
                          {active && <CheckSquare className="w-3.5 h-3.5 fill-current" />}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between px-12 py-10 bg-black/40 border-t border-white/5">
              <button
                onClick={() => setSelectedAmenities([])}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-accent transition-colors underline underline-offset-8 decoration-accent/20"
              >
                Reset All Criteria
              </button>

              <button
                onClick={() => setShowFilters(false)}
                className="px-12 py-5 rounded-[2rem] bg-accent text-white font-black text-lg shadow-2xl shadow-accent/20 hover:scale-[1.05] active:scale-95 transition-all tracking-tighter"
              >
                Search Villas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillaFilters;
