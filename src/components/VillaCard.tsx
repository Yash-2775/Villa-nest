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

      <div
        onClick={goToDetails}
        className="group cursor-pointer rounded-xl overflow-hidden transition-all duration-700 animate-fade-in relative bg-card border border-black/5 flex flex-col h-full"
        style={{
          animationDelay: `${index * 0.1}s`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}
      >
        {/* ================= IMAGE ================= */}
        <div className="relative h-72 overflow-hidden shrink-0">
          <img
            src={villa.main_image_url || "/placeholder.svg"}
            alt={villa.name || "Villa"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40" />

          {/* Favorite */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(villa.id);
            }}
            disabled={loading}
            className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-500 shadow-lg ${favorite
              ? "bg-accent text-white scale-110"
              : "bg-background/60 text-foreground hover:bg-background/80 border border-black/5"
              }`}
          >
            <Heart
              className={`w-4 h-4 ${favorite ? "fill-current" : ""}`}
            />
          </button>

          {/* Badge */}
          <div className="absolute top-4 left-4 z-10 px-4 py-1.5 bg-background border border-black/5 text-foreground text-[9px] font-black uppercase tracking-widest rounded-full">
            Verified
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-foreground text-white px-5 py-2.5 rounded-2xl flex items-baseline gap-1.5 shadow-2xl border border-white/10">
              <span className="text-xl font-black tracking-tighter">
                ₹{pricePerNight.toLocaleString()}
              </span>
              <span className="text-white/60 text-[8px] font-bold uppercase tracking-widest">/ night</span>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-8 flex-1 flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground leading-tight transition-colors duration-500 min-h-[3.5rem] line-clamp-2">
                {villa.name || "Unnamed Villa"}
              </h3>

              {villa.location && (
                <div className="flex items-center gap-1.5 text-foreground/40 leading-none">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{villa.location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 bg-secondary text-foreground/60 rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <Button
              className="w-full h-14 rounded-full bg-accent hover:bg-accent-hover text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-accent/10 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                goToDetails();
              }}
            >
              Check Availability
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VillaCard;