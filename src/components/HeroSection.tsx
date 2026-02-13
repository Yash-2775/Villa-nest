import { ArrowDown, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const goToProperties = () => {
    document
      .getElementById("properties")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-[95vh] flex items-center justify-center overflow-hidden grainy font-sans">
      {/* ================= BACKGROUND IMAGE ================= */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Estate"
          className="w-full h-full object-cover"
        />
        {/* Reinforced dark overlay for maximum text legibility */}
        <div className="absolute inset-0 bg-black/40 md:bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-12 text-center flex flex-col items-center">
          <div className="space-y-6 animate-fade-in-up">
            <Badge variant="outline" className="px-6 py-2 border-white/20 text-white rounded-full text-[10px] font-black tracking-[0.3em] uppercase bg-black/20 backdrop-blur-md">
              Coastal Villas
            </Badge>
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] italic drop-shadow-2xl">
              Luxury <br />
              <span className="text-accent">Villas</span>
            </h1>
            <p className="text-lg md:text-xl text-white font-medium max-w-2xl mx-auto leading-relaxed [text-shadow:_0_2px_10px_rgb(0_0_0_/_40%)]">
              Find the perfect villa for your next stay.
              Explore our hand-picked collection of beautiful homes.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up delay-200">
            <Button
              size="lg"
              className="h-14 rounded-full px-12 bg-accent hover:bg-accent-hover text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-accent/20"
              onClick={goToProperties}
            >
              Explore Collection
            </Button>
          </div>
        </div>
      </div>

      {/* ================= SCROLL INDICATOR ================= */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 animate-fade-in drop-shadow-sm">
        <div className="w-12 h-px bg-white/20" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Scroll to explore</span>
        <div className="w-12 h-px bg-white/20" />
      </div>
    </section>
  );
};

export default HeroSection;
