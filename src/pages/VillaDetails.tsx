import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BookingEngine from "@/components/BookingEngine";
import { Button } from "@/components/ui/button";

/* ================= EXISTING IMPORTS ================= */
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { Star } from "lucide-react";
/* ==================================================== */

import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

/* ✅ FIX: DEFINE REVIEW TYPE */
type Review = {
  id: string;
  rating?: number;
  comment?: string;
  user_name?: string;
  is_visible?: boolean;
};

const VillaDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Villa not found
      </div>
    );
  }

  /* ================= STATIC VILLA (UNCHANGED) ================= */

  const villa = {
    id,
    name: "Sea View Luxury Villa",
    location: "Alibaug, Maharashtra",
    price_per_night: 12000,
    price_hourly: 1500,
    amenities: ["Pool", "WiFi", "Parking"],
    description: "Luxury sea-facing villa",
    type: "Villa",
  };

  /* ================= REVIEWS ================= */

  /* ✅ FIX: USE STRONGLY TYPED STATE */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  const calculateAverage = (data: Review[]) => {
    if (data.length === 0) return null;
    const avg =
      data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length;
    return Number(avg.toFixed(1));
  };

  useEffect(() => {
    const loadReviews = async () => {
      const q = query(
        collection(db, "reviews"),
        where("villa_id", "==", id)
      );

      const snap = await getDocs(q);
      const data: Review[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, "id">),
      }));

      setReviews(data);

      const visible = data.filter((r) => r.is_visible !== false);
      setAvgRating(calculateAverage(visible));
    };

    loadReviews();
  }, [id]);

  /* ✅ FILTER VISIBLE REVIEWS */
  const visibleReviews = reviews.filter(
    (r) => r.is_visible !== false
  );

  const visibleReviewCount = visibleReviews.length;

  /* ================= REVIEW ELIGIBILITY ================= */

  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) {
        setCanReview(false);
        return;
      }

      const q = query(
        collection(db, "bookings"),
        where("user_id", "==", user.uid),
        where("villa_id", "==", id),
        where("status", "==", "confirmed")
      );

      const snap = await getDocs(q);
      setCanReview(!snap.empty);
    };

    checkEligibility();
  }, [user, id]);

  /* ================= SUBMIT REVIEW ================= */

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (!user || !canReview) return;

    if (!comment.trim()) {
      toast({
        title: "Empty review",
        description: "Please write a comment",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "reviews"), {
        villa_id: id,
        user_id: user.uid,
        user_name: user.displayName || user.email,
        rating,
        comment,
        created_at: serverTimestamp(),
        is_visible: true,
      });

      const q = query(
        collection(db, "reviews"),
        where("villa_id", "==", id)
      );

      const snap = await getDocs(q);
      const data: Review[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, "id">),
      }));

      setReviews(data);

      const visible = data.filter((r) => r.is_visible !== false);
      const newAvg = calculateAverage(visible);
      setAvgRating(newAvg);

      if (newAvg !== null) {
        await updateDoc(doc(db, "villas", id), {
          avg_rating: newAvg,
        });
      }

      setComment("");
      setRating(5);

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <Navbar />

      <main className="pt-24 container mx-auto px-4 max-w-5xl space-y-8 pb-32">
        <section>
          <h1 className="text-3xl font-bold mb-2">{villa.name}</h1>
          <p className="text-muted-foreground">{villa.location}</p>

          <div className="flex items-center gap-2 mt-2">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="font-semibold">
              {avgRating !== null ? avgRating : "No ratings yet"}
            </span>

            {visibleReviewCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({visibleReviewCount} reviews)
              </span>
            )}
          </div>
        </section>

        <BookingEngine villa={villa as any} />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Guest Reviews</h2>

          {user && canReview && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 cursor-pointer ${
                      i <= rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setRating(i)}
                  />
                ))}
              </div>

              <Textarea
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <Button onClick={submitReview} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          )}

          {user && !canReview && (
            <p className="text-sm text-muted-foreground">
              You can review this property only after completing a confirmed
              booking.
            </p>
          )}

          {visibleReviews.length === 0 && (
            <p className="text-muted-foreground">No reviews yet.</p>
          )}

          {visibleReviews.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{r.rating}</span>
              </div>

              <p className="text-sm">{r.comment}</p>

              <p className="text-xs text-muted-foreground">
                — {r.user_name || "Guest"}
              </p>
            </div>
          ))}
        </section>

        <Link to="/">
          <Button variant="outline">Back</Button>
        </Link>
      </main>
    </div>
  );
};

export default VillaDetails;
