import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VillaGrid from "@/components/VillaGrid";
import AddVillaForm from "@/components/AddVillaForm"; // ✅ NEW
import Footer from "@/components/Footer";
import { Leaf } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext"; // ✅ NEW
import { doc, getDoc } from "firebase/firestore"; // ✅ NEW
import { db } from "@/firebase/firestore"; // ✅ NEW
import { useEffect, useState } from "react"; // ✅ NEW
import { Button } from "@/components/ui/button"; // ✅ NEW

const Index = () => {
  /* ================= ADMIN CHECK ================= */
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [showAddVilla, setShowAddVilla] = useState(false);

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">

        <HeroSection />

        {/* ================= PROPERTIES SECTION ================= */}
        <section id="properties" className="container mx-auto px-4 pt-10">

          {/* ✅ ADMIN ONLY BUTTON */}
          {isAdmin && (
            <div className="mb-6 flex justify-end">
              <Button onClick={() => setShowAddVilla((v) => !v)}>
                {showAddVilla ? "Close Form" : "+ Add Property"}
              </Button>
            </div>
          )}

          {/* ✅ ADMIN ONLY FORM */}
          {isAdmin && showAddVilla && (
            <div className="mb-10">
              <AddVillaForm />
            </div>
          )}

          {/* EXISTING GRID — UNCHANGED */}
          <VillaGrid />
        </section>
      </main>
          <Footer />
    </div>
  );
};

export default Index;