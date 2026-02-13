import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

/* 📊 CHARTS */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Stat = ({ title, value }: { title: string; value: any }) => (
  <Card>
    <CardContent className="p-6 space-y-1">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgPlatformRating, setAvgPlatformRating] = useState<number | null>(null);
  const [topVillas, setTopVillas] = useState<
    { id: string; name: string; bookings: number }[]
  >([]);

  /* 🆕 PHASE 28 STATES */
  const [villas, setVillas] = useState<any[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadAnalytics = async () => {
      try {
        const bookingsSnap = await getDocs(collection(db, "bookings"));

        let revenue = 0;
        const villaBookingCount: Record<string, number> = {};
        const revenueByDate: Record<string, number> = {};

        bookingsSnap.forEach((doc) => {
          const data = doc.data();
          // Filter revenue specifically for confirmed or completed bookings
          if (data.status === "confirmed" || data.status === "completed") {
            const val = Number(data.total_price || 0);
            revenue += val;

            // Handle date conversion safely
            let dateStr = "Unknown";
            if (data.created_at && typeof data.created_at.toDate === "function") {
              dateStr = data.created_at.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" });
            } else if (data.created_at) {
              dateStr = new Date(data.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }

            if (dateStr !== "Unknown") {
              revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + val;
            }
          }

          if (data.villa_id) {
            villaBookingCount[data.villa_id] = (villaBookingCount[data.villa_id] || 0) + 1;
          }
        });

        setTotalBookings(bookingsSnap.size);
        setTotalRevenue(revenue);

        // Process and SORT chart data
        const chartData = Object.entries(revenueByDate)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // If no data, provide dummy data for visualization
        if (chartData.length === 0) {
          setRevenueChart([
            { date: "Day 1", revenue: 0 },
            { date: "Day 7", revenue: 0 },
          ]);
        } else {
          setRevenueChart(chartData);
        }

        const villasSnap = await getDocs(collection(db, "villas"));
        const villasList = villasSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setVillas(villasList);

        const villasWithStats = villasList
          .map((v: any) => ({
            id: v.id,
            name: v.name,
            bookings: villaBookingCount[v.id] || 0,
          }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5);

        setTopVillas(villasWithStats);

        const ratings = villasList
          .map((v: any) => v.avg_rating)
          .filter((r) => typeof r === "number" && r > 0);

        setAvgPlatformRating(
          ratings.length
            ? Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1))
            : null
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-8 pt-32 space-y-8 container mx-auto">
        <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-6">
          <Stat title="Total Bookings" value={totalBookings} />

          <Stat
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
          />

          <Stat
            title="Average Rating"
            value={avgPlatformRating ?? "N/A"}
          />

          <Stat title="Total Villas" value={villas.length} />
        </div>

        {/* 🏠 VILLA MODERATION */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Villa Moderation</h2>

            {villas.map((v) => (
              <div
                key={v.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{v.name}</span>
                <Button
                  variant={v.is_active === false ? "default" : "destructive"}
                  onClick={async () => {
                    await updateDoc(doc(db, "villas", v.id), {
                      is_active: v.is_active === false,
                    });
                    setVillas((prev) =>
                      prev.map((x) =>
                        x.id === v.id
                          ? { ...x, is_active: x.is_active === false }
                          : x
                      )
                    );
                  }}
                >
                  {v.is_active === false ? "Unhide" : "Hide"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 📈 REVENUE CHART */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChart}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;