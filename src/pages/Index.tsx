import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VillaGrid from "@/components/VillaGrid";
import AddVillaForm from "@/components/AddVillaForm"; // ✅ NEW
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
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

        {/* ================= FOOTER ================= */}
        <footer className="bg-foreground text-background py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-semibold">
                  VillaNest
                </span>
              </div>
              <p className="text-sm opacity-70">
                © 2024 VillaNest. Find your perfect getaway.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;