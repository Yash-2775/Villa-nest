import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firestore";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ---------- Helpers ---------- */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState("signin");

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || "/";

  /* ---------- Redirect if already logged in ---------- */
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  /* ---------- SIGN IN ---------- */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Signed in successfully" });
      navigate(from, { replace: true });
    } catch (error: any) {
      let message = "Sign in failed";

      if (error.code === "auth/user-not-found") {
        message = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password";
      } else if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password";
      }

      toast({
        title: "Authentication error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SIGN UP ---------- */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Update Auth profile
      await updateProfile(result.user, {
        displayName: displayName.trim(),
      });

      // ✅ CREATE FIRESTORE USER DOCUMENT (CRITICAL)
      await setDoc(doc(db, "users", result.user.uid), {
        name: displayName.trim(),
        email,
        role: "user",           // 👈 IMPORTANT
        createdAt: serverTimestamp(),
      });

      toast({ title: "Account created successfully" });
      navigate(from, { replace: true });

    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/leafbg.png')" }}
    >
      {/* Overlay to ensure readability if background is too light */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in duration-700">
        <Card className="glass border-white/40 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl bg-white/80">
          <CardHeader className="text-center pt-10 pb-4">
            <div className="flex flex-col items-center gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm border border-emerald/10 overflow-hidden">
                  <img src="/villalogo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="font-display text-2xl font-semibold tracking-tight text-emerald-dark">VillaNest</span>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-display text-emerald-dark">Welcome</CardTitle>
                <CardDescription className="text-emerald/70 font-medium">Sign in or create an account</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid grid-cols-2 p-1 bg-emerald/5 rounded-2xl mb-8">
                <TabsTrigger
                  value="signin"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-dark data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-dark data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* ---------- SIGN IN ---------- */}
              <TabsContent value="signin" className="m-0 focus-visible:outline-none">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-emerald-dark/80 font-semibold ml-1">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald/40 group-focus-within:text-emerald transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/50 border-emerald/10 focus:border-emerald/30 focus:ring-emerald/20 transition-all rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-emerald-dark/80 font-semibold ml-1">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald/40 group-focus-within:text-emerald transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/50 border-emerald/10 focus:border-emerald/30 focus:ring-emerald/20 transition-all rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald/40 hover:text-emerald transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-semibold shadow-lg shadow-emerald/20 transition-all hover:scale-[1.01] active:scale-[0.98]" disabled={loading}>
                    {loading ? (
                      <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-center">
                    <button type="button" className="text-sm font-medium text-emerald/60 hover:text-emerald transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <div className="pt-4 border-t border-emerald/5 text-center">
                    <p className="text-sm text-emerald/60">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("signup")}
                        className="font-bold text-emerald-dark hover:underline"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>

              {/* ---------- SIGN UP ---------- */}
              <TabsContent value="signup" className="m-0 focus-visible:outline-none">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-emerald-dark/80 font-semibold ml-1">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-12 bg-white/50 border-emerald/10 focus:border-emerald/30 focus:ring-emerald/20 transition-all rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-emerald-dark/80 font-semibold ml-1">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-white/50 border-emerald/10 focus:border-emerald/30 focus:ring-emerald/20 transition-all rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-emerald-dark/80 font-semibold ml-1">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-white/50 border-emerald/10 focus:border-emerald/30 focus:ring-emerald/20 transition-all rounded-xl"
                    />
                  </div>

                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-semibold shadow-lg shadow-emerald/20 transition-all hover:scale-[1.01] active:scale-[0.98]" disabled={loading}>
                    {loading ? (
                      <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <div className="pt-4 border-t border-emerald/5 text-center">
                    <p className="text-sm text-emerald/60">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("signin")}
                        className="font-bold text-emerald-dark hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
