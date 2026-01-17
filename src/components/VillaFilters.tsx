import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

import {
  Search,
  Filter,
  X,
  MapPin,
  Home,
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

  /* ================= NEW — AMENITIES STATE ================= */
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  /* ========================================================= */

  // Extract unique locations and types
  const locations = [...new Set(allVillas.map((v) => v.location))];
  const types = [...new Set(allVillas.map((v) => v.type))];
  const maxPrice = Math.max(...allVillas.map((v) => v.price_per_night), 30000);

  /* ================= NEW — EXTRACT AMENITIES ================= */
  const allAmenities = Array.from(
    new Set(allVillas.flatMap((v) => v.amenities ?? []))
  );
  /* =========================================================== */

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

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.location.toLowerCase().includes(query) ||
          v.description?.toLowerCase().includes(query) ||
          v.amenities.some((a) => a.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((v) => v.type === selectedType);
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter((v) => v.location === selectedLocation);
    }

    // Price filter
    filtered = filtered.filter(
      (v) =>
        v.price_per_night >= priceRange[0] &&
        v.price_per_night <= priceRange[1]
    );

    /* ================= NEW — AMENITIES FILTER ================= */
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((v) =>
        selectedAmenities.every((a) => v.amenities?.includes(a))
      );
    }
    /* ========================================================== */

    onFilter(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedLocation("all");
    setPriceRange([0, maxPrice]);
    setSelectedAmenities([]);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedType !== "all" ||
    selectedLocation !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice ||
    selectedAmenities.length > 0;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, location, or amenities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className={`gap-2 ${
            showFilters ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <Badge className="ml-1 bg-accent text-accent-foreground">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filter Properties</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Property Type
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Price
              </Label>
              <Slider
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
                min={0}
                max={maxPrice}
                step={1000}
              />
            </div>

            {/* ================= AMENITIES FILTER ================= */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Amenities
              </Label>
              <div className="flex flex-wrap gap-2">
                {allAmenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={
                      selectedAmenities.includes(amenity)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
            {/* =================================================== */}
          </div>
        </div>
      )}
    </div>
  );
};

export default VillaFilters;