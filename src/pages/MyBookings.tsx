import { useEffect, useState } from "react";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import {
  IndianRupee,
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
  payment?: PaymentInfo; // ✅ ADDED (NON-BREAKING)
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

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, "bookings"),
          where("user_id", "==", user.uid),
          orderBy("created_at", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Booking, "id">),
        }));

        const normalized = await Promise.all(
          data.map(async (b) => {
            if (b.status === "confirmed" && isPastBooking(b.end_date)) {
              await updateDoc(doc(db, "bookings", b.id), {
                status: "completed",
              });
              return { ...b, status: "completed" };
            }
            return b;
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
  }, [user]);

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
          b.id === bookingId ? { ...b, status: "cancelled" } : b
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
        return <Badge className="bg-emerald-500 text-white">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-3xl mb-6">My Bookings</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading bookings…</p>
        ) : bookings.length === 0 ? (
          <p className="text-muted-foreground">You have no bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b.id} className="border-border/50 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Home className="w-4 h-4 text-primary" />
                      Villa ID: {b.villa_id}
                    </div>
                    {statusBadge(b.status)}
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    {b.start_date} → {b.end_date}
                  </div>

                  {/* Type */}
                  <Badge variant="outline" className="w-fit">
                    {b.booking_type === "hourly"
                      ? "Day Visit"
                      : "Overnight Stay"}
                  </Badge>

                  {/* Price */}
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    {b.total_price.toLocaleString()}
                  </div>

                  {/* ✅ PAYMENT DETAILS (PHASE 17.3) */}
                  {b.payment && (
                    <div className="mt-3 p-3 rounded-lg bg-secondary/40 text-sm space-y-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Payment Details
                      </div>

                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        <span className="text-green-600 capitalize">
                          {b.payment.status}
                        </span>
                      </p>

                      <p>
                        <span className="font-medium">Transaction ID:</span>{" "}
                        {b.payment.transaction_id}
                      </p>

                      <p>
                        <span className="font-medium">Amount Paid:</span> ₹
                        {b.payment.amount.toLocaleString()}
                      </p>

                      <p>
                        <span className="font-medium">Method:</span>{" "}
                        {b.payment.method}
                      </p>
                    </div>
                  )}

                  {/* Cancel Button */}
                  {b.status === "confirmed" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cancelBooking(b.id)}
                      className="mt-2"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;