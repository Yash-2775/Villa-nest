import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  differenceInDays,
  format,
  parseISO,
} from "date-fns";

import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import BookingCalendar from "./BookingCalendar";
import PaymentModal from "./PaymentModal";

import type { DateRange } from "react-day-picker";
import type { Villa } from "@/types/villa";

import {
  CalendarDays,
  IndianRupee,
  Moon,
  Sun,
  LogIn,
} from "lucide-react";

/* ================= TYPES ================= */

interface BookingEngineProps {
  villa: Villa;
}

/* ================= CONSTANTS ================= */

const TIME_SLOTS = [
  "06:00","07:00","08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00","16:00","17:00",
  "18:00","19:00","20:00","21:00","22:00",
];

/* ================= COMPONENT ================= */

const BookingEngine = ({ villa }: BookingEngineProps) => {
  const [isHourly, setIsHourly] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  /* 🔥 PHASE 17.3 */
  const [bookedHours, setBookedHours] = useState<number[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= PREFILL USER ================= */

  useEffect(() => {
    if (user) {
      setGuestEmail(user.email || "");
      setGuestName(user.displayName || user.email?.split("@")[0] || "");
    }
  }, [user]);

  /* ================= PRICE ================= */

  const calculatePrice = () => {
    if (isHourly) {
      if (!selectedDate || !startTime || !endTime) {
        return { duration: 0, total: 0 };
      }

      const start = parseInt(startTime.split(":")[0]);
      const end = parseInt(endTime.split(":")[0]);
      const hours = end - start;

      if (hours <= 0) return { duration: 0, total: 0 };

      const base = (villa.price_hourly || 1500) * hours;
      return { duration: hours, total: Math.round(base * 1.18) };
    }

    if (!dateRange?.from || !dateRange?.to) {
      return { duration: 0, total: 0 };
    }

    const nights = differenceInDays(dateRange.to, dateRange.from);
    if (nights <= 0) return { duration: 0, total: 0 };

    const base = villa.price_per_night * nights;
    return { duration: nights, total: Math.round(base * 1.18) };
  };

  const pricing = calculatePrice();

  /* ================= AVAILABILITY ================= */

  const checkAvailability = async () => {
    const q = query(
      collection(db, "bookings"),
      where("villa_id", "==", villa.id),
      where("status", "==", "confirmed")
    );

    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
      const { start_date, end_date } = docSnap.data();

      const existingStart = parseISO(start_date);
      const existingEnd = parseISO(end_date);

      const newStart = isHourly ? selectedDate! : dateRange!.from!;
      const newEnd = isHourly ? selectedDate! : dateRange!.to!;

      if (newStart <= existingEnd && newEnd >= existingStart) {
        return false;
      }
    }

    return true;
  };

  /* ================= HOURLY BLOCKS ================= */

  useEffect(() => {
    if (!isHourly || !selectedDate) {
      setBookedHours([]);
      return;
    }

    const loadHourlyBookings = async () => {
      const q = query(
        collection(db, "bookings"),
        where("villa_id", "==", villa.id),
        where("status", "==", "confirmed"),
        where("booking_type", "==", "hourly")
      );

      const snap = await getDocs(q);
      const blocked: number[] = [];

      snap.docs.forEach((d) => {
        const data = d.data();
        const bookingDate = parseISO(data.start_date);

        if (bookingDate.toDateString() === selectedDate.toDateString()) {
          const start = parseInt(data.start_time || "0");
          const end = parseInt(data.end_time || "0");

          for (let h = start; h < end; h++) blocked.push(h);
        }
      });

      setBookedHours(blocked);
    };

    loadHourlyBookings();
  }, [isHourly, selectedDate, villa.id]);

  /* ================= BOOK ================= */

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to continue",
        variant: "destructive",
      });
      navigate("/auth", { state: { from: location.pathname } });
      return;
    }

    if (pricing.duration === 0) {
      toast({
        title: "Incomplete booking",
        description: "Please select date/time properly",
        variant: "destructive",
      });
      return;
    }

    setShowPayment(true);
  };

  /* ================= PAYMENT ================= */

  const handlePaymentConfirm = async () => {
    if (!user) return;

    setLoading(true);

    const available = await checkAvailability();
    if (!available) {
      toast({
        title: "Dates unavailable",
        description: "These dates were just booked by someone else.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        villa_id: villa.id,
        user_id: user.uid,

        guest_name: guestName,
        guest_email: guestEmail,

        start_date: isHourly
          ? format(selectedDate!, "yyyy-MM-dd")
          : format(dateRange!.from!, "yyyy-MM-dd"),

        end_date: isHourly
          ? format(selectedDate!, "yyyy-MM-dd")
          : format(dateRange!.to!, "yyyy-MM-dd"),

        // ✅ SAFE ADDITION (does not affect nightly bookings)
        start_time: isHourly ? startTime : null,
        end_time: isHourly ? endTime : null,

        total_price: pricing.total,
        booking_type: isHourly ? "hourly" : "nightly",

        status: "confirmed",
        payment_status: "paid",

        payment: {
          transaction_id: `TXN_${Date.now()}`,
          amount: pricing.total,
          currency: "INR",
          method: "mock_test",
          status: "success",
          paid_at: serverTimestamp(),
        },

        created_at: serverTimestamp(),
      });

      toast({
        title: "Booking confirmed",
        description: "Your booking has been secured.",
      });

      setShowPayment(false);
      navigate("/");
    } catch {
      toast({
        title: "Booking failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  /* ================= UI ================= */

  return (
    <>
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Book Your Stay
          </CardTitle>

          <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3 mt-4">
            <Moon className="w-4 h-4" />
            <Switch
              checked={isHourly}
              onCheckedChange={(checked) => {
                setIsHourly(checked);
                setDateRange(undefined);
                setSelectedDate(undefined);
                setStartTime("");
                setEndTime("");
              }}
            />
            <Sun className="w-4 h-4" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isHourly ? (
            <>
              <BookingCalendar
                villaId={villa.id}
                selectedRange={
                  selectedDate ? { from: selectedDate, to: selectedDate } : undefined
                }
                onSelectRange={(range) => setSelectedDate(range?.from)}
                mode="single"
              />

              <div className="grid grid-cols-2 gap-4">
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger><SelectValue placeholder="Start Time" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => {
                      const hour = parseInt(t.split(":")[0]);
                      const disabled = bookedHours.includes(hour);
                      return (
                        <SelectItem key={t} value={t} disabled={disabled}>
                          {t} {disabled ? "(Booked)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger><SelectValue placeholder="End Time" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.filter((t) => t > startTime).map((t) => {
                      const hour = parseInt(t.split(":")[0]);
                      const disabled = bookedHours.includes(hour);
                      return (
                        <SelectItem key={t} value={t} disabled={disabled}>
                          {t} {disabled ? "(Booked)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <BookingCalendar
              villaId={villa.id}
              selectedRange={dateRange}
              onSelectRange={setDateRange}
            />
          )}

          <Label>Your Name</Label>
          <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} />

          <Label>Email</Label>
          <Input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />

          {pricing.duration > 0 && (
            <div className="flex justify-between bg-secondary/50 p-4 rounded-lg">
              <span>Total</span>
              <span className="flex items-center gap-1 text-primary">
                <IndianRupee className="w-4 h-4" />
                {pricing.total.toLocaleString()}
              </span>
            </div>
          )}

          <Button onClick={handleBookNow} className="w-full" disabled={loading}>
            {!user ? (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Login to Book
              </span>
            ) : (
              "Proceed to Pay"
            )}
          </Button>
        </CardContent>
      </Card>

      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        totalPrice={pricing.total}
        onConfirm={handlePaymentConfirm}
      />
    </>
  );
};

export default BookingEngine;