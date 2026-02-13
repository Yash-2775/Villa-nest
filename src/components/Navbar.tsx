import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Leaf,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  ShieldPlus,
  BarChart3,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* 🔥 FIRESTORE */
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* 🔐 ADMIN STATE */
  const [isAdmin, setIsAdmin] = useState(false);

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

  const goToProperties = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("properties")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document
        .getElementById("properties")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userName = user?.displayName || user?.email?.split("@")[0];

  return (
    <nav className="fixed left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 w-[95%] max-w-7xl top-6 font-sans">
      <div className="p-4 rounded-[2.5rem] transition-all duration-500 bg-secondary/80 backdrop-blur-2xl border border-primary/10 shadow-xl overflow-hidden relative">
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* ================= LOGO ================= */}
          <Link
            to="/"
            className="flex items-center gap-3 transition-transform hover:scale-105 group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/5 group-hover:rotate-6 transition-transform overflow-hidden p-1">
              <img src="/villalogo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-foreground italic tracking-tighter leading-none">
                Villa<span className="text-accent">Nest</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground/30">Coastal Villas</span>
            </div>
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <div className="hidden lg:flex items-center gap-10">
            <button onClick={goToProperties} className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 hover:text-accent transition-all relative group">
              Properties
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-accent transition-all group-hover:w-full" />
            </button>
            {user && (
              <Link to="/my-bookings" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 hover:text-accent transition-all relative group">
                My Bookings
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-accent transition-all group-hover:w-full" />
              </Link>
            )}
            <Link to="/favorites" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 hover:text-accent transition-all relative group">
              Favorites
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-accent transition-all group-hover:w-full" />
            </Link>

            {isAdmin && (
              <>
                <Link to="/admin" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2 hover:opacity-80 transition-all">
                  <ShieldPlus className="w-3.5 h-3.5" />
                  Management
                </Link>
                <Link to="/admin/analytics" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2 hover:opacity-80 transition-all">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analytics
                </Link>
                <Link to="/admin/reviews" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2 hover:opacity-80 transition-all">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Reviews
                </Link>
              </>
            )}
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 text-foreground hover:bg-black/5 rounded-2xl px-6 h-12 border-black/10">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-bold tracking-tight">{userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-background border-black/5 rounded-3xl p-4 mt-4 animate-in zoom-in-95 shadow-2xl">
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="rounded-2xl h-14 px-4 hover:bg-black/5 cursor-pointer group">
                          <BarChart3 className="w-5 h-5 mr-3 text-accent" />
                          <span className="text-xs font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground">Villa Management</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black/5 my-2" />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-2xl h-14 px-4 hover:bg-destructive/10 text-destructive cursor-pointer group">
                      <LogOut className="w-5 h-5 mr-3" />
                      <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="bg-foreground text-white hover:bg-black rounded-full px-8 h-12 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {
        isOpen && (
          <div className="lg:hidden absolute top-[110%] left-0 right-0 bg-background border border-black/5 rounded-[2.5rem] p-8 animate-in slide-in-from-top-4 duration-500 overflow-hidden shadow-2xl">
            <div className="flex flex-col gap-8 relative z-10">
              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Navigation</span>
                <div className="flex flex-col gap-4">
                  <button onClick={() => { goToProperties(); setIsOpen(false); }} className="text-2xl font-bold italic text-foreground flex items-center justify-between group">
                    Villas <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                  </button>
                  {user && (
                    <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="text-2xl font-bold italic text-foreground flex items-center justify-between group">
                      My Bookings <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                    </Link>
                  )}
                  <Link to="/favorites" onClick={() => setIsOpen(false)} className="text-2xl font-bold italic text-foreground flex items-center justify-between group">
                    Favorites <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                  </Link>
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-6 pt-6 border-t border-black/5">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Administration</span>
                  <div className="grid grid-cols-1 gap-4">
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="bg-secondary p-4 rounded-xl text-xs font-bold text-foreground/60 text-center">Manage Villas</Link>
                  </div>
                </div>
              )}

              {!user ? (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full h-16 rounded-xl bg-accent text-white font-black uppercase tracking-widest">
                    Sign In
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full h-14 rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        )
      }
    </nav >
  );
};

export default Navbar;