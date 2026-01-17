import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* ================= TYPES ================= */

interface Booking {
  id: string;
  villa_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  payment_status: string;
}

/* ================= COMPONENT ================= */

const Admin = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      const q = query(
        collection(db, "bookings"),
        orderBy("created_at", "desc")
      );

      const snap = await getDocs(q);

      setBookings(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Booking),
        }))
      );

      setLoading(false);
    };

    fetchBookings();
  }, []);

  /* ================= ACTIONS ================= */

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "bookings", id), { status });

    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status } : b
      )
    );
  };

  /* ================= FILTERING ================= */

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    const matchesSearch =
      b.villa_id.toLowerCase().includes(search.toLowerCase()) ||
      b.user_id.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const statusBadge = (status: string) => {
    if (status === "confirmed")
      return <Badge className="bg-emerald-500 text-white">Confirmed</Badge>;
    if (status === "cancelled")
      return <Badge variant="destructive">Cancelled</Badge>;
    if (status === "completed")
      return <Badge variant="secondary">Completed</Badge>;
    return <Badge>{status}</Badge>;
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-display mb-6">
          Admin Dashboard
        </h1>

        {/* 🔎 CONTROLS */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search by Villa ID or User ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <strong>Villa:</strong> {b.villa_id}
                    {statusBadge(b.status)}
                  </div>

                  <div>User ID: {b.user_id}</div>
                  <div>{b.start_date} → {b.end_date}</div>
                  <div>₹ {b.total_price.toLocaleString()}</div>
                  <div>Payment: {b.payment_status}</div>

                  {b.status === "confirmed" && (
                    <div className="flex gap-3 mt-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatus(b.id, "completed")
                        }
                      >
                        Mark Completed
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          updateStatus(b.id, "cancelled")
                        }
                      >
                        Cancel Booking
                      </Button>
                    </div>
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

export default Admin;