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
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold">VillaNest</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={goToProperties}
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Properties
            </button>

            {user && (
              <Link
                to="/my-bookings"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                My Bookings
              </Link>
            )}

            <Link
              to="/favorites"
              className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Heart className="w-4 h-4" />
              Favorites
            </Link>

            {/* 🔥 ADMIN LINKS (DESKTOP) */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="text-sm font-medium text-primary flex items-center gap-1"
                >
                  <ShieldPlus className="w-4 h-4" />
                  Admin
                </Link>

                <Link
                  to="/admin/analytics"
                  className="text-sm font-medium text-primary flex items-center gap-1"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>

                <Link
                  to="/admin/reviews"
                  className="text-sm font-medium text-primary flex items-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  Reviews
                </Link>
              </>
            )}

            {/* USER DROPDOWN */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {userName}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/my-bookings">My Bookings</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/favorites">
                      <Heart className="w-4 h-4 mr-2" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <ShieldPlus className="w-4 h-4 mr-2" />
                          Admin
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/admin/analytics">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/admin/reviews">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Review Moderation
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-3">
              <button onClick={goToProperties}>Properties</button>
              {user && <Link to="/my-bookings">My Bookings</Link>}
              <Link to="/favorites">Favorites</Link>

              {isAdmin && (
                <>
                  <Link to="/admin">Admin</Link>
                  <Link to="/admin/analytics">Analytics</Link>
                  <Link to="/admin/reviews">Review Moderation</Link>
                </>
              )}

              {user ? (
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-destructive justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth">Sign In</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;