import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { Star } from "lucide-react";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
}

const ReviewList = ({ villaId }: { villaId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchReviews = async () => {
    console.log("🚀 Fetching reviews for villaId:", villaId);

    const q = query(
      collection(db, "reviews"),
      where("villa_id", "==", villaId),
      orderBy("created_at", "desc")
    );

    const snap = await getDocs(q);

    console.log("📦 Reviews found:", snap.size);

    setReviews(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Review),
      }))
    );
  };

  fetchReviews();
}, [villaId]);

  if (loading) {
    return <p className="text-muted-foreground">Loading reviews…</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-muted-foreground">No reviews yet.</p>;
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* ⭐ SUMMARY */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold">
          {avgRating.toFixed(1)}
        </span>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i <= Math.round(avgRating)
                  ? "text-yellow-400"
                  : "text-muted-foreground"
              }`}
              fill={i <= Math.round(avgRating) ? "currentColor" : "none"}
            />
          ))}
        </div>

        <span className="text-muted-foreground">
          ({reviews.length} reviews)
        </span>
      </div>

      {/* 📝 LIST */}
      {reviews.map((r) => (
        <div key={r.id} className="border rounded-lg p-4">
          <div className="flex justify-between">
            <span className="font-semibold">{r.user_name}</span>
            <span className="text-gold">
              {"★".repeat(r.rating)}
            </span>
          </div>
          <p className="text-sm mt-2">{r.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;