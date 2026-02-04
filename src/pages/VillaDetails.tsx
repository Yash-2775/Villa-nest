import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/* ================= MATERIAL ICON ================= */
const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-icons-outlined ${className}`}>{name}</span>
);

/* ================= TYPES ================= */
type Review = {
  id: string;
  rating?: number;
  comment?: string;
  user_name?: string;
  is_visible?: boolean;
};

type Villa = {
  id: string;
  name: string;
  location: string;
  price_per_night: number;
  amenities: string[];
  description: string;
  images: string[];
};

const FALLBACK_IMAGE = "/placeholder.svg";

/* ================= UTILS ================= */
const formatDate = (d: Date | null) =>
  d
    ? d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Select date";

/* ================= COMPONENT ================= */
const VillaDetails = () => {
  const { id: rawId } = useParams();
  const id = rawId ? decodeURIComponent(rawId) : null;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [guests, setGuests] = useState(2);

  

  /* ===== CALENDAR STATE ===== */
  const today = new Date();
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [month, setMonth] = useState(new Date());

  /* ================= LOAD VILLA ================= */
  useEffect(() => {
    if (!id) return;

    const loadVilla = async () => {
      try {
        const snap = await getDoc(doc(db, "villas", id));
        if (!snap.exists()) {
          setVilla(null);
          return;
        }

        const d = snap.data();
        setVilla({
          id: snap.id,
          name: d.name ?? "Unnamed Villa",
          location: d.location ?? "Unknown location",
          price_per_night: Number(d.price_per_night ?? 0),
          amenities: Array.isArray(d.amenities) ? d.amenities : [],
          description: d.description ?? "",
          images:
            Array.isArray(d.images) && d.images.length
              ? d.images
              : d.main_image_url
              ? [d.main_image_url]
              : [FALLBACK_IMAGE],
        });
      } finally {
        setLoading(false);
      }
    };

    loadVilla();
  }, [id]);

  /* ================= LOAD REVIEWS ================= */
  useEffect(() => {
    if (!villa) return;

    const loadReviews = async () => {
      const q = query(
        collection(db, "reviews"),
        where("villa_id", "==", villa.id)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Review),
      }));
      const visible = data.filter(r => r.is_visible !== false);
      setReviews(visible);

      if (visible.length) {
        const avg =
          visible.reduce((s, r) => s + (r.rating || 0), 0) / visible.length;
        setAvgRating(+avg.toFixed(2));
      }
    };

    loadReviews();
  }, [villa]);

  /* ================= SUBMIT REVIEW ================= */
  const submitReview = async () => {
    if (!user || !comment.trim() || !villa) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, "reviews"), {
        villa_id: villa.id,
        user_id: user.uid,
        user_name: user.displayName || user.email,
        rating: 5,
        comment,
        is_visible: true,
        created_at: serverTimestamp(),
      });
      toast({ title: "Review submitted" });
      setComment("");
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= CALENDAR HELPERS ================= */
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const startDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1
  ).getDay();

  const isPast = (d: Date) =>
    d.setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0);

  const onDateClick = (d: Date) => {
    if (isPast(d)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(d);
      setCheckOut(null);
    } else if (d > checkIn) {
      setCheckOut(d);
      setShowCalendar(false);
    }
  };

  /* ================= STATES ================= */
  if (loading)
    return <div className="h-screen grid place-items-center">Loading…</div>;

  if (!villa)
    return <div className="h-screen grid place-items-center">Villa not found</div>;

  /* ================= UI ================= */
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        <div className="flex justify-end mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <MI name="arrow_back" className="mr-2 text-sm" />
            Back
          </Button>
        </div>

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
            {villa.name}
          </h1>
          <div className="flex gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <MI name="place" className="text-primary text-sm" />
              {villa.location}
            </span>
            {avgRating && (
              <span className="flex items-center gap-1">
                <MI name="star" className="text-yellow-400 text-sm" />
                {avgRating}
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-12">
            {/* IMAGES */}
              <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[420px] md:h-[620px] rounded-3xl overflow-hidden">

                {/* MAIN IMAGE */}
                <div className="col-span-4 md:col-span-2 row-span-2 relative group overflow-hidden rounded-2xl cursor-pointer">
                  <img
                    src={villa.images[0]}
                    alt={villa.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                </div>

                {/* SIDE IMAGES */}
                {villa.images.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="hidden md:block relative group overflow-hidden rounded-2xl cursor-pointer"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>

                    {i === 3 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-semibold text-sm">
                          Show all photos
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            {/* ABOUT */}
            <section>
              <h2 className="text-2xl font-serif font-bold mb-4">
                About this villa
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                {villa.description}
              </p>
            </section>

            {/* AMENITIES */}
            <section>
              <h2 className="text-2xl font-serif font-bold mb-6">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                {villa.amenities.map(a => (
                  <div key={a} className="flex items-center gap-4">
                    <MI name="check_circle" className="text-primary" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* REVIEWS */}
            <section>
              <h2 className="text-2xl font-serif font-bold mb-6">Reviews</h2>

              {reviews.map(r => (
                <div key={r.id} className="border rounded-xl p-4 mb-4">
                  <p className="text-sm">{r.comment}</p>
                  <p className="text-xs text-slate-500">— {r.user_name}</p>
                </div>
              ))}

              {user && (
                <div className="border rounded-xl p-4 space-y-3">
                  <Textarea
                    placeholder="Write your review…"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <Button onClick={submitReview} disabled={submitting}>
                    Submit Review
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT – BOOKING */}
          <div className="relative">
            <div className="sticky top-28 bg-white border rounded-3xl p-8 shadow-xl">
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  ₹{villa.price_per_night.toLocaleString()}
                </span>{" "}
                / night
                <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                        <MI name="star" className="text-yellow-400 text-sm" />
                        <span>{avgRating ?? "New"}</span>
                      </div>
              </div>

              {/* INPUTS */}
              <div
                className="border rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setShowCalendar(v => !v)}
              >
                <div className="grid grid-cols-2 border-b">
                  <div className="p-3 border-r">
                    <label className="text-[10px] font-bold">CHECK-IN</label>
                    <div className="text-sm">{formatDate(checkIn)}</div>
                  </div>
                  <div className="p-3">
                    <label className="text-[10px] font-bold">CHECK-OUT</label>
                    <div className="text-sm">{formatDate(checkOut)}</div>
                  </div>
                <div className="p-3 border-t">
                    <label className="text-[10px] font-bold">GUESTS</label>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">
                        {guests} guest{guests > 1 ? "s" : ""}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // prevents calendar toggle
                            setGuests(g => Math.max(1, g - 1));
                          }}
                          className="w-7 h-7 rounded-full border flex items-center justify-center text-lg"
                        >
                          −
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuests(g => g + 1);
                          }}
                          className="w-7 h-7 rounded-full border flex items-center justify-center text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CALENDAR */}
              {showCalendar && (
                <div className="mt-4 bg-slate-50 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-3">
                    <button
                      onClick={() =>
                        setMonth(
                          new Date(month.getFullYear(), month.getMonth() - 1)
                        )
                      }
                    >
                      ◀
                    </button>
                    <span className="font-bold">
                      {month.toLocaleString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() =>
                        setMonth(
                          new Date(month.getFullYear(), month.getMonth() + 1)
                        )
                      }
                    >
                      ▶
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-xs text-center mb-2">
                    {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map(d => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-sm">
                    {[...Array(startDay)].map((_, i) => (
                      <div key={i} />
                    ))}

                    {[...Array(daysInMonth)].map((_, i) => {
                      const d = new Date(
                        month.getFullYear(),
                        month.getMonth(),
                        i + 1
                      );

                      const selected =
                        (checkIn &&
                          d.toDateString() === checkIn.toDateString()) ||
                        (checkOut &&
                          d.toDateString() === checkOut.toDateString());

                      return (
                        <button
                          key={i}
                          disabled={isPast(d)}
                          onClick={() => onDateClick(d)}
                          className={`py-1 rounded-full ${
                            selected
                              ? "bg-primary text-white font-bold"
                              : "hover:bg-primary/10"
                          } ${
                            isPast(d)
                              ? "text-slate-300 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            

                {checkIn && checkOut && (
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span>
                        ₹{villa.price_per_night.toLocaleString()} ×{" "}
                        {Math.ceil(
                          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
                        )} nights
                      </span>
                      <span>
                        ₹{(
                          villa.price_per_night *
                          Math.ceil(
                            (checkOut.getTime() - checkIn.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        ).toLocaleString()}
                      </span>
                    </div>
                     <div className="flex justify-between"> 
                              <span>Service fee</span>
                              <span>₹12,400</span>
                            </div>

                            <div className="flex justify-between">
                              <span>Taxes</span>
                              <span>₹4,500</span>
                            </div>

                            <div className="border-t pt-3 flex justify-between font-bold text-base">
                              <span>Total</span>
                              <span>₹1,51,900</span>
                            </div>
                          </div>
                        )}

              <Button className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl mb-4">
                  Book Now
                </Button>

                <p className="text-center text-sm text-slate-500 italic mb-6">
                  You won’t be charged yet
                  <div className="border rounded-xl p-4 flex items-center gap-3 text-sm">
                    <MI name="emoji_events" className="text-primary" />
                    <div>
                      <p className="font-semibold">Price Match Guarantee</p>
                      <p className="text-slate-500">
                        We guarantee the lowest price on our platform
                      </p>
                    </div>
                  </div>

                </p>
                
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VillaDetails;