import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Villa } from "@/types/villa";

/* ================= IMG UPLOAD ================= */

const uploadToImgBB = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    "https://api.imgbb.com/1/upload?key=f1414520053897f7268c1ca87ea2d274",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");

  return data.data.url as string;
};

/* ================= PROPS ================= */

interface AddVillaFormProps {
  villa?: Villa;
  onClose?: () => void;
}

/* ================= COMPONENT ================= */

const AddVillaForm = ({ villa, onClose }: AddVillaFormProps) => {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [amenities, setAmenities] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= PREFILL (EDIT MODE) ================= */

  useEffect(() => {
    if (villa) {
      setName(villa.name || "");
      setLocation(villa.location || "");
      setPrice(String(villa.pricePerNight || ""));
      setAmenities((villa.amenities || []).join(", "));
    }
  }, [villa]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!name || !location || !price) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = villa?.main_image_url || "";

      // Upload new image only if changed
      if (imageFile) {
        imageUrl = await uploadToImgBB(imageFile);
      }

      const payload = {
        name,
        location,
        pricePerNight: Number(price),
        amenities: amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        main_image_url: imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (villa) {
        // ✏️ EDIT
        await updateDoc(doc(db, "villas", villa.id), payload);
        toast({ title: "Villa refined successfully" });
      } else {
        // ➕ ADD
        await addDoc(collection(db, "villas"), {
          ...payload,
          avg_rating: 0,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Villa committed to collection" });
      }

      onClose?.();
    } catch (error) {
      console.error("Error saving villa:", error);
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background p-12 rounded-2xl border border-black/5 shadow-2xl relative overflow-hidden max-w-2xl w-full">
      <div className="relative z-10 space-y-10">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-foreground tracking-tight">
            {villa ? "Refine Villa" : "Propose Villa"}
          </h2>
          <p className="text-foreground/40 text-sm font-light">
            Enter the architectural details for the new coastal collection entry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Villa Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 bg-secondary border-black/5 rounded-xl focus-visible:ring-accent focus-visible:border-accent/40"
              placeholder="e.g. The Azure Pavilion"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Locale</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-14 bg-secondary border-black/5 rounded-xl focus-visible:ring-accent focus-visible:border-accent/40"
              placeholder="e.g. Udaipur, Rajasthan"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nightly Investment (₹)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-14 bg-secondary border-black/5 rounded-xl focus-visible:ring-accent focus-visible:border-accent/40"
              placeholder="15000"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Villa Portrait</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="h-14 bg-secondary border-black/5 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-black hover:file:text-white transition-all cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Villa Amenities (Comma Separated)</Label>
          <Textarea
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            className="min-h-[120px] bg-secondary border-black/5 rounded-xl focus-visible:ring-accent focus-visible:border-accent/40 p-6"
            placeholder="Private Pool, Wellness Curator, Organic Orchard..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="h-16 flex-1 rounded-full bg-foreground text-white hover:bg-black font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95"
          >
            {loading ? "Orchestrating..." : villa ? "Refine Entry" : "Commit to Collection"}
          </Button>

          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="h-16 px-10 rounded-full border-black/5 hover:bg-white transition-all font-black uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddVillaForm;