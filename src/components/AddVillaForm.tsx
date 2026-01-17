import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

import { Card, CardContent } from "@/components/ui/card";
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
      setPrice(String(villa.price_per_night || ""));
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
        price_per_night: Number(price),
        amenities: amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        main_image_url: imageUrl,
        updated_at: serverTimestamp(),
      };

      if (villa) {
        // ✏️ EDIT
        await updateDoc(doc(db, "villas", villa.id), payload);
        toast({ title: "Villa updated successfully" });
      } else {
        // ➕ ADD
        await addDoc(collection(db, "villas"), {
          ...payload,
          avg_rating: 0,
          created_at: serverTimestamp(),
        });
        toast({ title: "Villa added successfully" });
      }

      onClose?.();
    } catch {
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
    <Card className="max-w-xl">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          {villa ? "Edit Villa" : "Add New Villa"}
        </h2>

        <div>
          <Label>Villa Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div>
          <Label>Price per Night (₹)</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <Label>Amenities</Label>
          <Textarea
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
          />
        </div>

        <div>
          <Label>Villa Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Saving..." : villa ? "Update Villa" : "Add Villa"}
          </Button>

          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AddVillaForm;