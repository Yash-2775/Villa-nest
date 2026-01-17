import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AdminAddVilla = () => {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddVilla = async () => {
    if (!name || !location || !price || !imageUrl) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "villas"), {
        name,
        location,
        price_per_night: Number(price),
        main_image_url: imageUrl,
        description,
        amenities: [],
        created_at: serverTimestamp(),
      });

      toast({
        title: "Villa added",
        description: "New villa added successfully",
      });

      // Reset form
      setName("");
      setLocation("");
      setPrice("");
      setImageUrl("");
      setDescription("");
    } catch (error) {
      toast({
        title: "Failed",
        description: "Could not add villa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Villa</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Villa Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <Label>Price Per Night (₹)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <Label>Main Image URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/villa.jpg"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button onClick={handleAddVilla} disabled={loading}>
              {loading ? "Adding..." : "Add Villa"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAddVilla;