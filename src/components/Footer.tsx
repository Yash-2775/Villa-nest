import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="relative bg-secondary text-foreground py-24 overflow-hidden Grainy border-t border-black/5">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">

          {/* Brand Identity */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 border border-primary/5 shadow-lg transition-transform group-hover:rotate-6 overflow-hidden">
                <img src="/villalogo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <span className="text-3xl font-black italic tracking-tighter">
                Villa<span className="text-accent">Nest</span>
              </span>
            </Link>
            <div className="space-y-6">
              <p className="text-foreground/50 text-sm leading-relaxed max-w-sm">
                The best villas for your next stay.
                Safe and beautiful places for you and your family.
              </p>
            </div>
            <div className="flex gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group cursor-pointer bg-background">
                  <div className="w-1.5 h-1.5 bg-black/20 group-hover:bg-white rounded-full transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Navigation</h4>
            <ul className="space-y-4">
              {['Villas', 'Favorites', 'My Bookings', 'The Standard'].map(item => (
                <li key={item}>
                  <a href="#" className="text-foreground/60 hover:text-accent transition-colors text-sm font-medium tracking-tight flex items-center gap-2 group">
                    <span className="w-0 h-px bg-accent transition-all group-hover:w-4" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Connect</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-background border border-black/5 flex items-center justify-center text-accent">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-foreground font-bold text-sm">Concierge Enclave</span>
                  <span className="text-foreground/40 text-xs">Coastal Passage, Mumbai</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-background border border-black/5 flex items-center justify-center text-accent">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-foreground font-bold text-sm">Priority Support</span>
                  <span className="text-foreground/40 text-xs">concierge@villanest.coastal</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">The Dispatch</h4>
            <p className="text-foreground/40 text-sm font-light leading-relaxed">
              Subscribe for invitations to newly curated coastal villas.
            </p>
            <div className="relative group">
              <input
                type="email"
                placeholder="guest@email.com"
                className="w-full bg-background border-black/5 rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all h-auto shadow-sm"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 bg-foreground text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                Find a Villa
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-foreground/20 text-[10px] font-black uppercase tracking-[0.4em]">
            &copy; 2026 VillaNest Coastal. All Rights Reserved.
          </p>
          <div className="flex gap-10">
            {['Privacy Policy', 'Terms of Coastal', 'Cookies'].map(item => (
              <a key={item} href="#" className="text-foreground/20 hover:text-accent transition-colors text-[10px] font-black uppercase tracking-widest">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
