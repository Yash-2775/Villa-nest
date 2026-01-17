import { useEffect, useState } from "react";
import { collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";

interface Villa {
  id: string;
  name: string;
  location: string;
  price_per_night: number;
  image?: string;
}

const Favorites = () => {
  const { user } = useAuth();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      try {
        /** 1️⃣ Load favorite villa IDs */
        const favRef = doc(db, "favorites", user.uid);
        const favSnap = await getDoc(favRef);

        if (!favSnap.exists()) {
          setVillas([]);
          setLoading(false);
          return;
        }

        const favoriteIds: string[] = favSnap.data().villas || [];

        if (favoriteIds.length === 0) {
          setVillas([]);
          setLoading(false);
          return;
        }

        /** 2️⃣ Fetch villa documents */
        const villasQuery = query(
          collection(db, "villas"),
          where("__name__", "in", favoriteIds)
        );

        const villasSnap = await getDocs(villasQuery);

        const data = villasSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Villa, "id">),
        }));

        setVillas(data);
      } catch (error) {
        console.error("Failed to load favorites", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 container mx-auto px-4">
        <h1 className="font-display text-3xl mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          Favorites
        </h1>

        {loading ? (
          <p className="text-muted-foreground">Loading favorites…</p>
        ) : villas.length === 0 ? (
          <p className="text-muted-foreground">
            Avoid regrets. Save villas you love ❤️
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villas.map((villa) => (
              <Card key={villa.id} className="hover:shadow-lg transition">
                <CardContent className="p-4 space-y-3">
                  {villa.image && (
                    <img
                      src={villa.image}
                      alt={villa.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}

                  <h2 className="font-semibold text-lg">{villa.name}</h2>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {villa.location}
                  </div>

                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    {(villa.price_per_night ?? 0).toLocaleString()} / night
                  </div>

                  <Link to={`/villas/${villa.id}`}>
                    <Button className="w-full mt-2">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
