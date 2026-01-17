import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      const snap = await getDocs(collection(db, "reviews"));
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setReviews(data);
      setLoading(false);
    };

    loadReviews();
  }, []);

  const toggleVisibility = async (reviewId: string, current: boolean) => {
    await updateDoc(doc(db, "reviews", reviewId), {
      is_visible: !current,
    });

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, is_visible: !current } : r
      )
    );
  };

  if (loading) return <p className="p-6">Loading reviews...</p>;

  return (
    <div className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">Review Moderation</h1>

      {reviews.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-6 space-y-2">
            <p className="font-semibold">
              ⭐ {r.rating} — {r.user_name}
            </p>

            <p className="text-sm text-muted-foreground">
              Villa ID: {r.villa_id}
            </p>

            <p>{r.comment}</p>

            <Button
              variant={r.is_visible === false ? "default" : "destructive"}
              onClick={() =>
                toggleVisibility(r.id, r.is_visible !== false)
              }
            >
              {r.is_visible === false ? "Unhide Review" : "Hide Review"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminReviews;