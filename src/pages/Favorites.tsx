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

      <main className="pt-32 container mx-auto px-6 space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-accent fill-accent" />
            </div>
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">Your Collection</h1>
              <p className="text-foreground/40 text-sm mt-4 font-light leading-relaxed">
                Your favorite villas saved for your next trip.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-secondary/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : villas.length === 0 ? (
          <div className="py-32 text-center space-y-8 bg-secondary/30 rounded-[3rem] border border-black/5">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-accent/20" />
            </div>
            <p className="text-xl font-bold text-foreground/40 italic">
              Your collection is currently waiting for its first entry.
            </p>
            <Link to="/">
              <Button variant="outline" className="rounded-full px-10 h-14 border-black/10 hover:bg-background transition-all font-black uppercase tracking-widest text-[9px]">
                Explore Villas
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {villas.map((villa) => (
              <div
                key={villa.id}
                className="group relative bg-card rounded-[2.5rem] overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all duration-700"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={villa.image || "/placeholder.svg"}
                    alt={villa.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{villa.name}</h2>
                    <div className="flex items-center gap-2 text-foreground/40">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{villa.location}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tighter">₹{(villa.price_per_night ?? 0).toLocaleString()}</span>
                    <span className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest">/ night</span>
                  </div>

                  <Link to={`/villas/${villa.id}`}>
                    <Button className="w-full h-14 rounded-full bg-foreground text-white hover:bg-black font-black uppercase tracking-widest text-[10px] shadow-lg transition-all">
                      View Villa
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
