import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MapPin, Info, Calendar, Users, Home, Utensils, IndianRupee } from "lucide-react";

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
  const [isAdmin, setIsAdmin] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [guests, setGuests] = useState(2);
  const [bookingType, setBookingType] = useState<"night" | "hour" | "person">("person");
  const [stayType, setStayType] = useState<"Full Villa" | "Private Rooms">("Full Villa");
  const [foodOption, setFoodOption] = useState<"with" | "without">("without");
  const [rooms, setRooms] = useState(1);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  /* ===== CALENDAR STATE ===== */
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

  /* ================= CHECK ADMIN ================= */
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      setIsAdmin(snap.exists() && snap.data().role === "admin");
    };
    checkAdmin();
  }, [user]);

  /* ================= DELETE VILLA ================= */
  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this villa?")) return;
    try {
      await deleteDoc(doc(db, "villas", id));
      toast({ title: "Villa deleted successfully" });
      navigate("/");
    } catch {
      toast({ title: "Failed to delete villa", variant: "destructive" });
    }
  };

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

  /* ================= BOOKING LOGIC ================= */
  const calculateTotalPrice = () => {
    if (!villa || !checkIn || !checkOut) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    let basePrice = villa.price_per_night;

    if (bookingType === "hour") basePrice = villa.price_per_night / 10;
    if (bookingType === "person") basePrice = villa.price_per_night / 2;

    let total = basePrice * nights;
    if (bookingType === "person") total *= guests;
    if (stayType === "Private Rooms") total *= rooms;

    return Math.round(total);
  };

  const handleInitiateBooking = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You must be logged in to book a villa.",
      });
      navigate("/auth");
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Missing dates",
        description: "Please select check-in and check-out dates.",
        variant: "destructive",
      });
      setShowCalendar(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!user || !villa || !checkIn || !checkOut) return;
    setIsFinalizing(true);

    const refId = "VN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const totalPrice = calculateTotalPrice();

    try {
      await addDoc(collection(db, "bookings"), {
        villa_id: villa.id,
        villa_name: villa.name,
        user_id: user.uid,
        user_email: user.email,
        user_name: user.displayName || user.email,
        start_date: checkIn.toISOString().split("T")[0],
        end_date: checkOut.toISOString().split("T")[0],
        total_price: totalPrice,
        booking_type: bookingType === "hour" ? "hourly" : "nightly",
        status: "confirmed",
        created_at: serverTimestamp(),
        rooms: stayType === "Private Rooms" ? rooms : "Full Villa",
        meal_plan: foodOption,
        guests: guests,
        reference_id: refId,
      });

      setBookingId(refId);
      setIsBooked(true);
      setShowConfirmModal(false);
      toast({
        title: "Booking confirmed!",
        description: "Your escape has been successfully scheduled.",
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFinalizing(false);
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
  if (loading || !villa)
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-40 pb-32 space-y-12">
          <div className="h-12 w-48 bg-secondary animate-pulse rounded-full ml-auto" />
          <div className="space-y-4">
            <div className="h-20 w-2/3 bg-secondary animate-pulse rounded-3xl" />
            <div className="h-6 w-1/3 bg-secondary animate-pulse rounded-full" />
          </div>
          <div className="grid grid-cols-4 gap-4 h-[600px]">
            <div className="col-span-2 row-span-2 bg-secondary animate-pulse rounded-[3rem]" />
            <div className="bg-secondary animate-pulse rounded-[2rem]" />
            <div className="bg-secondary animate-pulse rounded-[2rem]" />
            <div className="bg-secondary animate-pulse rounded-[2rem]" />
            <div className="bg-secondary animate-pulse rounded-[2rem]" />
          </div>
        </main>
      </div>
    );

  /* ================= UI ================= */
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-40 pb-32">
        <div className="flex justify-between items-center mb-16">
          <div className="flex gap-4">
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  className="rounded-full px-8 h-12 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => navigate(`/admin/edit-villa/${villa.id}`)}
                >
                  Edit Villa
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-full px-8 h-12"
                  onClick={handleDelete}
                >
                  Delete Villa
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" className="rounded-full px-8 h-12 border-black/5 hover:bg-secondary transition-all group" onClick={() => navigate(-1)}>
            <MI name="arrow_back" className="mr-3 text-sm transition-transform group-hover:-translate-x-1" />
            Back to Villas
          </Button>
        </div>

        {/* HEADER */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] italic">
                {villa.name}
              </h1>
              <div className="flex flex-wrap gap-6 text-muted-foreground items-center">
                <span className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                    <MI name="place" className="text-primary text-lg" />
                  </div>
                  <span className="font-semibold">{villa.location}</span>
                </span>
                {avgRating && (
                  <span className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center transition-colors group-hover:bg-accent/20">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                    </div>
                    <span className="font-bold text-foreground">
                      {avgRating} <span className="text-muted-foreground font-normal ml-1">({reviews.length} reviews)</span>
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <MI name="verified" className="text-primary text-lg" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Verified Villa</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-7 space-y-20">
            {/* IMAGES GALLERY - DESKTOP */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[700px] rounded-[3rem] overflow-hidden shadow-2xl">
              <div
                className="col-span-2 row-span-2 relative group overflow-hidden cursor-zoom-in"
                onClick={() => setEnlargedImage(villa.images[0])}
              >
                <img
                  src={villa.images[0]}
                  alt={villa.name}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity duration-700"></div>
              </div>

              {villa.images.slice(1, 4).map((img, i) => (
                <div
                  key={i}
                  className="relative group overflow-hidden cursor-zoom-in"
                  onClick={() => setEnlargedImage(img)}
                >
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity duration-700"></div>
                </div>
              ))}

              {/* LAST IMAGE SLOT WITH GALLERY OVERLAY */}
              {villa.images[4] && (
                <div
                  className="relative group overflow-hidden cursor-zoom-in"
                  onClick={() => setEnlargedImage(villa.images[4])}
                >
                  <img
                    src={villa.images[4]}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-all backdrop-blur-[2px] group-hover:backdrop-blur-0 group-hover:bg-black/20">
                    <MI name="photo_library" className="text-white text-3xl mb-2" />
                    <span className="text-white font-black tracking-widest uppercase text-[10px]">
                      View Full Gallery
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* IMAGES GALLERY - MOBILE CAROUSEL */}
            <div className="md:hidden relative group">
              <Carousel className="w-full">
                <CarouselContent>
                  {villa.images.map((img, i) => (
                    <CarouselItem key={i}>
                      <div
                        className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl"
                        onClick={() => setEnlargedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`${villa.name} - ${i + 1}`}
                          loading={i === 0 ? "eager" : "lazy"}
                          fetchPriority={i === 0 ? "high" : "low"}
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                  Swipe to view ({villa.images.length} images)
                </div>
              </Carousel>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                  onClick={() => setEnlargedImage(villa.images[0])}
                >
                  Click here to view all images
                </Button>
              </div>
            </div>

            {/* STACKED PROPERTY DETAILS (Image Style) */}
            <div className="space-y-20 pt-16 border-t border-black/5">
              <section className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-foreground">About this villa</h2>
                <p className="text-foreground/60 text-lg leading-relaxed font-light max-w-4xl">
                  {villa.description}
                </p>
              </section>

              <section className="space-y-10">
                <h2 className="text-3xl font-serif font-bold text-foreground">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
                  {villa.amenities.map(a => (
                    <div key={a} className="flex items-center gap-4">
                      <div className="text-emerald-500 shrink-0">
                        <MI name="check_circle" className="text-[24px]" />
                      </div>
                      <span className="text-foreground/70 font-medium tracking-tight whitespace-nowrap">{a}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* MAP SECTION */}
              <section className="space-y-10 pt-16 border-t border-black/5">
                <div className="space-y-4">
                  <h2 className="text-3xl font-serif font-bold text-foreground">Location</h2>
                  <p className="text-foreground/40 text-sm font-light">
                    View the cinematic surroundings and exact locale of {villa.name}.
                  </p>
                </div>
                <div className="w-full h-[450px] rounded-[2.5rem] overflow-hidden border border-black/5 shadow-inner">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(villa.location + " " + villa.name)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              </section>
            </div>

            {/* REVIEWS SECTION */}
            <section className="pt-16 border-t border-black/5">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-4xl font-bold italic tracking-tight">Guest Reviews</h2>
                <div className="h-[1px] flex-1 mx-8 bg-border/50 hidden md:block" />
                <Button variant="outline" className="rounded-full font-bold">Share Your Story</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map(r => (
                  <div key={r.id} className="bg-background border border-border/40 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3 h-3 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-foreground/80 leading-relaxed mb-6 italic">"{r.comment}"</p>
                    <div className="flex items-center gap-3 border-t pt-4">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-[10px]">
                        {r.user_name?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">— {r.user_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT – STICKY BOOKING ISLAND */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-40 glass border border-white/50 rounded-[3rem] p-10 shadow-ShadowElegant space-y-10 overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150" />

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Rates From</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">
                      ₹{bookingType === "night" ? villa.price_per_night.toLocaleString() : bookingType === "hour" ? (villa.price_per_night / 10).toLocaleString() : (villa.price_per_night / 2).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground font-medium text-sm">
                      {bookingType === "night" ? "/ night" : bookingType === "hour" ? "/ hour" : "/ person"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 bg-accent/10 px-4 py-2 rounded-full text-accent font-bold text-sm shadow-sm">
                    <Star className="w-4 h-4 fill-accent" />
                    {avgRating ?? "NEW"}
                  </div>
                </div>
              </div>

              {/* NEW — BOOKING OPTIONS */}
              <div className="relative z-10 space-y-4">
                {/* Booking Type */}
                <div className="grid grid-cols-3 gap-2 bg-background/40 p-1 rounded-2xl border border-border/40">
                  {(["person", "night", "hour"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBookingType(t)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${bookingType === t ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-foreground"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Stay Type & Food */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pl-1">Property Access</label>
                    <div className="flex bg-background/40 p-1 rounded-xl border border-border/40">
                      {(["Full Villa", "Private Rooms"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStayType(s)}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${stayType === s ? "bg-accent text-white" : "text-foreground/40"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CONDITIONAL ROOM COUNTER */}
                  {stayType === "Private Rooms" && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pl-1">Number of Rooms</label>
                      <div className="flex bg-background/40 p-1.5 rounded-xl border border-border/40 items-center justify-between">
                        <span className="text-[10px] font-bold text-foreground pl-3">{rooms} {rooms > 1 ? "rooms" : "room"}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setRooms(r => Math.max(1, r - 1))} className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-sm transition-all hover:bg-primary hover:text-white">−</button>
                          <button onClick={() => setRooms(r => r + 1)} className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-sm transition-all hover:bg-primary hover:text-white">+</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground pl-1">Meal Plan</label>
                    <div className="flex bg-background/40 p-1 rounded-xl border border-border/40">
                      {(["with", "without"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFoodOption(f)}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${foodOption === f ? "bg-accent text-white" : "text-foreground/40"}`}
                        >
                          {f === "with" ? "Food" : "None"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 bg-background/40 border border-border/60 rounded-[2rem] p-2 space-y-1 shadow-inner shadow-black/5">
                <div className="grid grid-cols-2 gap-1 cursor-pointer" onClick={() => setShowCalendar(v => !v)}>
                  <div className="p-5 hover:bg-background/60 rounded-2xl transition-all duration-300">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Check In</label>
                    <div className="text-base font-bold text-foreground">{formatDate(checkIn)}</div>
                  </div>
                  <div className="p-5 hover:bg-background/60 rounded-2xl transition-all duration-300">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Check Out</label>
                    <div className="text-base font-bold text-foreground">{formatDate(checkOut)}</div>
                  </div>
                </div>

                <div className="p-5 hover:bg-background/60 rounded-2xl transition-all duration-300 cursor-default">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 block">Number of Guests</label>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{guests} guest{guests > 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-xl transition-all hover:bg-primary hover:text-white">−</button>
                      <button onClick={() => setGuests(g => g + 1)} className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-xl transition-all hover:bg-primary hover:text-white">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {showCalendar && (
                <div className="relative z-10 bg-background/80 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300 border border-border/20">
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} className="p-2 hover:bg-secondary rounded-full">◀</button>
                    <span className="font-bold text-lg tracking-tight italic">{month.toLocaleString("en-IN", { month: "long", year: "numeric" })}</span>
                    <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} className="p-2 hover:bg-secondary rounded-full">▶</button>
                  </div>
                  <div className="grid grid-cols-7 text-[10px] font-black tracking-widest text-center opacity-40 mb-4">
                    {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(startDay)].map((_, i) => <div key={i} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const d = new Date(month.getFullYear(), month.getMonth(), i + 1);
                      const selected = (checkIn && d.toDateString() === checkIn.toDateString()) || (checkOut && d.toDateString() === checkOut.toDateString());
                      return (
                        <button
                          key={i}
                          disabled={isPast(d)}
                          onClick={() => onDateClick(d)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${selected ? "bg-primary text-white font-black scale-110 shadow-lg shadow-primary/20" : "hover:bg-primary/10 font-medium"} ${isPast(d) ? "opacity-10 cursor-not-allowed" : ""}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {checkIn && checkOut && (
                <div className="relative z-10 bg-primary/5 rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-5 duration-500">
                  <div className="flex justify-between text-base font-medium">
                    <span className="opacity-70">Escape Duration</span>
                    <span className="font-bold">{Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                  </div>
                  <div className="flex justify-between text-base border-t border-primary/10 pt-4">
                    <span className="font-bold">Total Villa Investment</span>
                    <span className="text-xl font-black">₹{calculateTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              )}

              {isBooked ? (
                <div className="relative z-10 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-xl shadow-emerald-500/5">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                      <MI name="done_all" className="text-white text-4xl" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-extrabold text-emerald-900 text-2xl tracking-tight leading-tight">Booking Request Submitted Successfully!</p>
                      <p className="text-sm text-emerald-700/80 font-medium px-4">
                        Thank you for booking with us. Your villa booking request has been received. Our admin team will contact you within 24 hours to confirm the details.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-3xl p-6 text-left space-y-4 border border-emerald-200/50 backdrop-blur-sm shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/50 mb-2">Booking Summary</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center group/item">
                        <span className="text-[11px] font-bold text-emerald-900/40 uppercase tracking-tighter">Villa Name</span>
                        <span className="text-sm font-black text-emerald-900 tracking-tight">{villa.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-emerald-900/40 uppercase tracking-tighter">Check-in</span>
                        <span className="text-sm font-black text-emerald-900 tracking-tight">{formatDate(checkIn)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-emerald-900/40 uppercase tracking-tighter">Check-out</span>
                        <span className="text-sm font-black text-emerald-900 tracking-tight">{formatDate(checkOut)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-emerald-900/40 uppercase tracking-tighter">Guests</span>
                        <span className="text-sm font-black text-emerald-900 tracking-tight">{guests} Guests</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-emerald-200/50">
                        <span className="text-[11px] font-bold text-emerald-900/40 uppercase tracking-tighter">Total Amount</span>
                        <span className="text-lg font-black text-emerald-900 tracking-tighter">₹{calculateTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-900 text-white rounded-2xl py-4 px-6 shadow-lg shadow-emerald-900/20">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Booking Reference ID</p>
                    <p className="text-lg font-mono font-black tracking-widest">{bookingId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest border-emerald-200 text-emerald-900 hover:bg-emerald-100/50"
                    >
                      Back to Home
                    </Button>
                    <Button
                      onClick={() => navigate("/my-bookings")}
                      className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                    >
                      View My Bookings
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleInitiateBooking}
                  className="relative z-10 w-full h-20 bg-primary hover:bg-primary/90 text-white font-black text-2xl rounded-[1.5rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Book Villa
                </Button>
              )}

              <div className="relative z-10 flex flex-col gap-4">
                {isBooked && (
                  <div className="bg-secondary/40 p-10 rounded-[2.5rem] border border-black/5 space-y-4 shadow-sm animate-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                        <MI name="support_agent" className="text-2xl" />
                      </div>
                      <p className="text-lg font-black text-foreground tracking-tight uppercase">Priority Assistance</p>
                    </div>
                    <div className="space-y-4 text-base font-bold text-foreground/70 leading-relaxed">
                      <div className="space-y-1">
                        <p>For any queries or emergencies, please contact</p>
                        <p className="text-accent font-black text-xl italic tracking-tight">Suyog Lale – 7276744140</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-center text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">We guarantee the lowest price on our platform</p>
                <div className="bg-background/40 border border-border/20 rounded-3xl p-5 flex items-center gap-4 group/trust cursor-help shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg transition-transform duration-500 group-hover/trust:rotate-12">
                    <MI name="auto_awesome" className="text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">Stay Protection</p>
                    <p className="text-[10px] font-medium text-muted-foreground">Certified 2026 Lowest Price Guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= BOOKING CONFIRMATION MODAL ================= */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md w-[90%] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl glass">
          <DialogHeader className="p-8 pb-4 bg-primary/5">
            <DialogTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Confirm Your Stay
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 border border-black/5">
                <Home className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property</p>
                  <p className="font-bold text-lg">{villa.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/40 border border-black/5">
                  <Calendar className="w-4 h-4 text-primary mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Check-In</p>
                  <p className="font-bold text-sm">{formatDate(checkIn)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 border border-black/5">
                  <Calendar className="w-4 h-4 text-primary mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Check-Out</p>
                  <p className="font-bold text-sm">{formatDate(checkOut)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/40 border border-black/5">
                  <Users className="w-4 h-4 text-primary mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Guests</p>
                  <p className="font-bold text-sm">{guests} Guests</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 border border-black/5">
                  <Info className="w-4 h-4 text-primary mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Plan</p>
                  <p className="font-bold text-sm uppercase">{stayType}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-900">Total Cost </span>
                </div>
                <span className="text-2xl font-black text-emerald-600 tracking-tighter">
                  ₹{calculateTotalPrice().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-black/10 hover:bg-secondary"
            >
              Cancel / Edit
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={isFinalizing}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-lg shadow-primary/20"
            >
              {isFinalizing ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= IMAGE ENLARGEMENT MODAL ================= */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in duration-500"
          onWheel={(e) => setZoomScale(prev => Math.min(Math.max(1, prev + (e.deltaY < 0 ? 0.2 : -0.2)), 3))}
        >
          {/* Controls */}
          <div className="absolute top-10 right-10 flex gap-4 z-[1001]">
            <button
              onClick={() => setZoomScale(s => Math.min(s + 0.2, 3))}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
            >
              <MI name="zoom_in" className="text-2xl" />
            </button>
            <button
              onClick={() => setZoomScale(s => Math.max(s - 0.2, 1))}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
            >
              <MI name="zoom_out" className="text-2xl" />
            </button>
            <button
              onClick={() => { setEnlargedImage(null); setZoomScale(1); }}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
            >
              <MI name="close" className="text-2xl" />
            </button>
          </div>

          {/* Image Container */}
          <div
            className="w-full h-full flex items-center justify-center overflow-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            onClick={() => { setEnlargedImage(null); setZoomScale(1); }}
          >
            <img
              src={enlargedImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain transition-transform duration-300 ease-out shadow-2xl rounded-2xl"
              style={{ transform: `scale(${zoomScale})` }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-[10px] uppercase font-black tracking-[0.4em] pointer-events-none">
            Scroll to zoom • Click outside to close
          </div>
        </div>
      )}
    </div>
  );
};

export default VillaDetails;