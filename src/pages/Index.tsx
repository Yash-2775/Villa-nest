import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VillaGrid from "@/components/VillaGrid";
import SanctuaryTrust from "@/components/SanctuaryTrust";
import AddVillaForm from "@/components/AddVillaForm"; // ✅ NEW
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

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

        {/* ================= PROPERTIES SECTION START ================= */}
        <div id="properties" className="relative">
          {/* ✅ MOVE VILLA TITLE HERE */}
          <div className="text-center space-y-6 pt-32 pb-16 bg-background">
            <Badge variant="outline" className="px-6 py-2 border-black/5 text-foreground/60 rounded-full text-[10px] font-black tracking-[0.3em] uppercase bg-secondary/50 shadow-sm">
              Our Best Villas
            </Badge>
            <h2 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-none">
              Selected <span className="text-accent italic font-serif">Villas</span>
            </h2>
            <p className="text-foreground/50 text-xl font-light tracking-wide max-w-2xl mx-auto">
              Beautiful homes hand-picked for your perfect holiday.
            </p>
          </div>

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

          <VillaGrid showHeader={false} />

          {/* ================= COMMITMENT / TRUST ACT ================= */}
          <SanctuaryTrust />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;