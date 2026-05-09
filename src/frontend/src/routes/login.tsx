import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store";
import { loginUser, seedDemoDataIfEmpty } from "@/utils/auth";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Leaf, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ensure demo data exists
  useEffect(() => {
    seedDemoDataIfEmpty();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate({ to: "/" });
    }
  }, [currentUser, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 500));
    const result = loginUser(email, password);
    setLoading(false);
    if (!result.success || !result.user) {
      setError(result.error ?? "Login failed.");
      return;
    }
    setCurrentUser(result.user);
    toast.success(`Welcome back, ${result.user.name.split(" ")[0]}!`);
    navigate({ to: "/" });
  }

  function fillDemo() {
    setEmail("admin@homeopath.com");
    setPassword("Admin@123");
    setError("");
  }

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900"
      data-ocid="login.page"
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[15%] w-96 h-96 rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute top-[40%] left-[-5%] w-72 h-72 rounded-full bg-emerald-500/8 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shadow-xl shadow-violet-900/40 mb-5 backdrop-blur-md">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            HomeoPath CRM
          </h1>
          <p className="text-sm text-white/50">
            Professional Clinic Management System
          </p>
        </motion.div>

        {/* Login card */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl p-7 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
            <p className="text-xs text-white/45 mb-6">
              Access your clinic dashboard
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-white/70 mb-1.5 block">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="admin@homeopath.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="glass border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:border-primary/50"
                  autoComplete="email"
                  data-ocid="login.email_input"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-medium text-white/70">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => toast.info("Password reset coming soon.")}
                    className="text-xs text-primary/70 hover:text-primary transition-colors"
                    data-ocid="login.forgot_password"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="glass border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:border-primary/50 pr-10"
                    autoComplete="current-password"
                    data-ocid="login.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                  data-ocid="login.error_state"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold gap-2 h-10"
                data-ocid="login.submit_button"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Sign In
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-white/40">
                New clinic?{" "}
                <a
                  href="/register"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                  data-ocid="login.register_link"
                >
                  Register your clinic
                </a>
              </p>
            </div>
          </div>

          {/* Demo credentials hint */}
          <button
            type="button"
            onClick={fillDemo}
            className="mt-4 w-full bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-all text-left group"
            data-ocid="login.demo_credentials"
          >
            <p className="text-xs font-semibold text-white/60 group-hover:text-white/80 mb-1">
              🔑 Demo Credentials
            </p>
            <p className="text-xs text-white/35">
              admin@homeopath.com / Admin@123
            </p>
            <p className="text-[10px] text-white/25 mt-0.5">
              Click to auto-fill
            </p>
          </button>
        </motion.div>

        <motion.p
          className="mt-10 text-[11px] text-white/20 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          HomeoPath CRM v2.0 — Secure &amp; Professional
        </motion.p>
      </div>
    </div>
  );
}
