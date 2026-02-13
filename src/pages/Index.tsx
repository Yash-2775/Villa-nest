import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VillaGrid from "@/components/VillaGrid";
import SanctuaryTrust from "@/components/SanctuaryTrust";
import AddVillaForm from "@/components/AddVillaForm"; // ✅ NEW
import Footer from "@/components/Footer";

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
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent selection:text-white">
      <Navbar />

      <main className="flex-1">
        <HeroSection />

        {/* ================= COMMITMENT / TRUST ACT ================= */}
        <SanctuaryTrust />

        {/* ================= PROPERTIES SECTION ================= */}
        <div id="properties" className="relative grainy">
          {/* ✅ ADMIN ONLY BUTTON */}
          {isAdmin && (
            <div className="container mx-auto px-4 py-10 flex justify-end">
              <Button
                onClick={() => setShowAddVilla((v) => !v)}
                className="rounded-full px-8 bg-primary hover:bg-black font-black uppercase tracking-widest text-[10px]"
              >
                {showAddVilla ? "Close Villa Form" : "+ Propose New Villa"}
              </Button>
            </div>
          )}

          {/* ✅ ADMIN ONLY FORM */}
          {isAdmin && showAddVilla && (
            <div className="container mx-auto px-4 mb-10">
              <AddVillaForm />
            </div>
          )}

          <VillaGrid />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;