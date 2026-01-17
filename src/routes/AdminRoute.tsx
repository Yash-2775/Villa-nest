import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

/*
  ✅ AdminRoute
  - Protects all admin pages
  - Used for:
      /admin
      /admin/analytics
      /admin/bookings
      /admin/users
*/

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Admin check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // ⏳ Checking admin permissions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking permissions…
      </div>
    );
  }

  // ❌ Logged in but not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // ✅ Admin verified
  return <>{children}</>;
};

export default AdminRoute;