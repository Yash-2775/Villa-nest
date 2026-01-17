import { ArrowDown, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const scrollToProperties = () => {
    document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = () => {
    scrollToProperties();
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/80" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-background/10 backdrop-blur-sm rounded-full animate-fade-in">
            <span className="text-sm font-medium text-primary-foreground">
              ✨ Premium Villas & Farmhouses Across India
            </span>
          </div>
          
          <h1 
            className="font-display text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Find Your{" "}
            <span className="text-primary">Sanctuary</span>
          </h1>
          
          <p 
            className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            From serene beachside villas to rustic mountain retreats, 
            discover handpicked properties that redefine luxury living.
          </p>

          {/* Search Bar */}
          <div 
            className="max-w-xl mx-auto bg-background/95 backdrop-blur-md rounded-2xl p-2 shadow-elegant animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text"
                  placeholder="Search by location (Goa, Lonavala, Kerala...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-12 px-6 bg-primary hover:bg-emerald-dark"
              >
                Search
              </Button>
            </div>
          </div>

          <button
            onClick={scrollToProperties}
            className="group inline-flex flex-col items-center gap-2 animate-fade-in mt-12"
            style={{ animationDelay: "0.4s" }}
          >
            <span className="text-sm font-medium text-primary-foreground/70 group-hover:text-primary-foreground transition-colors">
              Explore All Properties
            </span>
            <div className="w-10 h-10 rounded-full border-2 border-primary-foreground/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/20 transition-all">
              <ArrowDown className="w-4 h-4 text-primary-foreground animate-bounce" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
