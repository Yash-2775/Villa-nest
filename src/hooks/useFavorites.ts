import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load favorites
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      const ref = doc(db, "favorites", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setFavorites(snap.data().villas || []);
      }
    };

    fetchFavorites();
  }, [user]);

  const isFavorite = (villaId: string) => {
    return favorites.includes(villaId);
  };

  const toggleFavorite = async (villaId: string) => {
    if (!user) return;

    setLoading(true);
    const ref = doc(db, "favorites", user.uid);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, { villas: [villaId] });
      setFavorites([villaId]);
    } else {
      if (favorites.includes(villaId)) {
        await updateDoc(ref, {
          villas: arrayRemove(villaId),
        });
        setFavorites(favorites.filter((id) => id !== villaId));
      } else {
        await updateDoc(ref, {
          villas: arrayUnion(villaId),
        });
        setFavorites([...favorites, villaId]);
      }
    }

    setLoading(false);
  };

  return { isFavorite, toggleFavorite, favorites, loading };
};
