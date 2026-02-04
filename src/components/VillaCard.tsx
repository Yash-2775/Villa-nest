import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  IndianRupee,
  Star,
  Heart,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import type { Villa } from "@/types/villa";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useToast } from "@/hooks/use-toast";

/* ✅ NEW */
import AddVillaForm from "@/components/AddVillaForm";

interface VillaCardProps {
  villa: Villa;
  index: number;
}

const VillaCard = ({ villa, index }: VillaCardProps) => {
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const favorite = isFavorite(villa.id);

  const { user } = useAuth();
  const { toast } = useToast();
    const navigate = useNavigate();

  const goToDetails = () => {
    navigate(`/villas/${encodeURIComponent(villa.id)}`);
  };


  /* ================= ADMIN CHECK ================= */
  const [isAdmin, setIsAdmin] = useState(false);

  /* ✅ NEW — EDIT STATE */
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      setIsAdmin(snap.exists() && snap.data().role === "admin");
    };
    checkAdmin();
  }, [user]);

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this villa?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "villas", villa.id));
      toast({
        title: "Villa deleted",
        description: "The property has been removed successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete villa",
        variant: "destructive",
      });
    }
  };

  /* ================= SAFE DEFAULTS ================= */
  const pricePerNight =
  typeof villa.pricePerNight === "number"
    ? villa.pricePerNight
    : typeof (villa as any).price_per_night === "number"
    ? (villa as any).price_per_night
    : 0;

  const hourlyPrice =
    typeof villa.price_hourly === "number"
      ? villa.price_hourly
      : null;

  const amenities = Array.isArray(villa.amenities)
    ? villa.amenities
    : [];

  return (
    <>
      {/* ================= EDIT MODAL ================= */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <AddVillaForm
            villa={villa}
            onClose={() => setEditing(false)}
          />
        </div>
      )}

      <div onClick={goToDetails}
          className="group bg-card cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-elegant transition-all duration-500 animate-fade-in border border-border/50 relative"
          style={{ animationDelay: `${index * 0.1}s` }}
        >

        {/* ================= ADMIN CONTROLS ================= */}
        {isAdmin && (
          <div className="absolute top-3 left-3 z-20 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >

              <Pencil className="w-4 h-4" />
            </Button>

            <Button
                size="icon"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >

              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ================= IMAGE ================= */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={villa.main_image_url || "/placeholder.svg"}
            alt={villa.name || "Villa"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

          {/* Favorite */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(villa.id);
            }}
            disabled={loading}
            className={`absolute bottom-4 right-4 p-2 rounded-full backdrop-blur-sm transition ${
              favorite
                ? "bg-destructive text-destructive-foreground"
                : "bg-background/80 text-muted-foreground hover:text-destructive"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${favorite ? "fill-current" : ""}`}
            />
          </button>

          {/* Rating */}
          {typeof villa.avg_rating === "number" && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-background/90 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-semibold">
                {villa.avg_rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-6">
          <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition">
            {villa.name || "Unnamed Villa"}
          </h3>

          {villa.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">{villa.location}</span>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs px-2.5 py-1 bg-secondary rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              <span className="font-bold text-lg">
                {pricePerNight.toLocaleString()}
              </span>
              <span className="text-xs opacity-70">/night</span>
            </div>

            {hourlyPrice && (
              <span className="text-xs opacity-70">
                ₹{hourlyPrice}/hr
              </span>
            )}
          </div>

          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              goToDetails();
            }}
            >
            View Details
          </Button>

        </div>
      </div>
    </>
  );
};

export default VillaCard;