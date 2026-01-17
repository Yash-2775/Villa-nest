import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import VillaDetails from "@/pages/VillaDetails";
import Favorites from "@/pages/Favorites";
import MyBookings from "@/pages/MyBookings";
import Admin from "@/pages/Admin";

import AdminAddVilla from "@/pages/AdminAddVilla";
import AdminDashboard from "@/pages/admin/AdminDashboard";

/* ✅ NEW — REVIEW MODERATION */
import AdminReviews from "@/pages/admin/AdminReviews";

import Navbar from "@/components/Navbar";

/* ================= USER PROTECTED ================= */

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

/* ================= ADMIN PROTECTED ================= */

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

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

  if (isAdmin === null) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return children;
};

/* ================= APP ================= */

const App = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/auth";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/villas/:id" element={<VillaDetails />} />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* 🔐 ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/add-villa"
          element={
            <AdminRoute>
              <AdminAddVilla />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* 🔐 ADMIN — REVIEW MODERATION */}
        <Route
          path="/admin/reviews"
          element={
            <AdminRoute>
              <AdminReviews />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;