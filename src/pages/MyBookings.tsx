import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";


import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import {
  CalendarDays,
  Home,
  XCircle,
  CreditCard,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

interface PaymentInfo {
  amount: number;
  currency: string;
  method: string;
  status: string;
  transaction_id: string;
  paid_at: any;
}

interface Booking {
  id: string;
  villa_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  booking_type: "hourly" | "nightly";
  status: "confirmed" | "completed" | "cancelled";
  payment?: PaymentInfo;
}

/* ---------------- HELPERS ---------------- */

const isPastBooking = (endDate: string) => {
  const today = new Date();
  const end = new Date(endDate);
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end < today;
};

/* ---------------- COMPONENT ---------------- */

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  /* 🔐 CHECK ADMIN */
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      setIsAdmin(snap.exists() && snap.data().role === "admin");
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        let q;
        if (isAdmin) {
          // Admins see everything
          q = query(
            collection(db, "bookings"),
            orderBy("created_at", "desc")
          );
        } else {
          // Regular users see only their own
          q = query(
            collection(db, "bookings"),
            where("user_id", "==", user.uid),
            orderBy("created_at", "desc")
          );
        }

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Booking, "id">),
        }));

        const normalized: Booking[] = await Promise.all(
          data.map(async (b) => {
            if (b.status === "confirmed" && isPastBooking(b.end_date)) {
              await updateDoc(doc(db, "bookings", b.id), {
                status: "completed",
              });
              return { ...b, status: "completed" as const };
            }
            return b as Booking;
          })
        );

        setBookings(normalized);
      } catch (error) {
        console.error("Failed to load bookings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, isAdmin]);

  /* ---------------- CANCEL BOOKING ---------------- */

  const cancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "cancelled",
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? ({ ...b, status: "cancelled" } as Booking) : b
        )
      );

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
    } catch {
      toast({
        title: "Cancellation failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  /* ---------------- STATUS BADGE ---------------- */

  const statusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500 text-white border-none">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-secondary text-foreground/60 border-none">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="border-none">Cancelled</Badge>;
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 container mx-auto px-6 max-w-5xl space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">
              {isAdmin ? "Management Portal" : "Your Journeys"}
            </h1>
            {isAdmin && (
              <Badge className="bg-accent text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ml-4">
                Administrator
              </Badge>
            )}
          </div>
          <p className="text-foreground/40 text-sm font-light max-w-lg">
            {isAdmin
              ? "Oversee and manage all platform bookings and guest itineraries."
              : "A chronological record of your coastal escapes and upcoming villa journeys."}
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-secondary/30 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-32 text-center space-y-8 bg-secondary/30 rounded-[3rem] border border-black/5">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto">
              <CalendarDays className="w-8 h-8 text-primary/20" />
            </div>
            <p className="text-xl font-bold text-foreground/40 italic">
              Your itinerary is currently clear.
            </p>
            <Link to="/">
              <Button variant="outline" className="rounded-full px-10 h-14 border-black/10 hover:bg-background transition-all font-black uppercase tracking-widest text-[9px]">
                Find a Villa
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="group relative bg-card rounded-[2.5rem] p-10 border border-black/5 shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden"
              >
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Home className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[12px] font-black uppercase tracking-widest text-foreground leading-none">
                          {(b as any).villa_name || `Villa ID: ${b.villa_id}`}
                        </span>
                      </div>
                      {statusBadge(b.status)}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {(b as any).reference_id && (
                        <Badge variant="outline" className="h-6 px-3 rounded-full border-black/5 text-[8px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary">
                          Ref: {(b as any).reference_id}
                        </Badge>
                      )}
                      {(b as any).guests && (
                        <Badge variant="outline" className="h-6 px-3 rounded-full border-black/5 text-[8px] font-black uppercase tracking-[0.2em]">
                          {(b as any).guests} Guests
                        </Badge>
                      )}
                      {(b as any).rooms && (
                        <Badge variant="outline" className="h-6 px-3 rounded-full border-black/5 text-[8px] font-black uppercase tracking-[0.2em]">
                          {(b as any).rooms === "Full Villa" ? "Full Villa" : `${(b as any).rooms} Rooms`}
                        </Badge>
                      )}
                      {(b as any).meal_plan && (
                        <Badge variant="outline" className="h-6 px-3 rounded-full border-black/5 text-[8px] font-black uppercase tracking-[0.2em]">
                          {(b as any).meal_plan === "with" ? "Food Included" : "No Meals"}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                        <span>{b.start_date}</span>
                        <span className="text-foreground/20">→</span>
                        <span>{b.end_date}</span>
                      </div>
                      <Badge variant="outline" className="h-8 px-4 rounded-full border-black/5 text-[9px] font-black uppercase tracking-widest text-foreground/40">
                        {b.booking_type === "hourly" ? "Day Visit" : "Overnight Stay"}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tighter">₹{b.total_price.toLocaleString()}</span>
                      <span className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest">Investment Total</span>
                    </div>

                    {b.payment && (
                      <div className="p-6 rounded-2xl bg-secondary/30 border border-black/5 space-y-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Payment Ledger</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[8px] font-black uppercase tracking-widest text-foreground/40">Method</span>
                            <span className="text-xs font-bold uppercase">{b.payment.method}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-black uppercase tracking-widest text-foreground/40">Transaction</span>
                            <span className="text-xs font-bold uppercase truncate block">{b.payment.transaction_id}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {b.status === "confirmed" && (
                    <div className="flex flex-col gap-4">
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => cancelBooking(b.id)}
                        className="h-14 rounded-full px-8 bg-black/5 hover:bg-destructive text-destructive hover:text-white border border-destructive/20 font-black uppercase tracking-widest text-[9px] transition-all"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Retract Journey
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;