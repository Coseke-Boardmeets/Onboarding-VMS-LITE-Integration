"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function LoginPage() {
  const { loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Theme Sync
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return savedTheme === "dark" || (!savedTheme && prefersDark)
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      localStorage.setItem("theme", "light");
    }
  };

  // Redirect if logged in
  useEffect(() => {
    router.push("/");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          <span className="text-sm font-semibold text-slate-400">
            Restoring session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-350 overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating Theme Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:scale-105 active:scale-95 shadow-sm text-slate-800 dark:text-slate-200 transition-all z-10 cursor-pointer"
      >
        {theme === "light" ? (
          <DarkModeIcon className="h-5 w-5 text-slate-900" />
        ) : (
          <LightModeIcon className="h-5 w-5 text-amber-400" />
        )}
      </button>

      {/* Main Container */}
      <div className="w-full max-w-[440px] z-10">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-14 w-14 mb-4 flex items-center justify-center rounded-2xl bg-white p-2 border border-slate-200 dark:border-slate-800 shadow-md">
            <Image
              src="/coseke_logo.png"
              alt="Coseke Logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Reception Desk Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-semibold max-w-[280px]">
            Log in to manage visitors, check-ins, and view real-time site
            analytics.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-955/20 border border-rose-200/80 dark:border-rose-900/30 text-xs font-bold text-rose-700 dark:text-rose-455">
                {errorMessage}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-350 tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative font-sans">
                <EmailOutlinedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="name@coseke.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 pr-4 py-2.5 h-11 border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-350 tracking-wide uppercase">
                Password
              </label>
              <div className="relative font-sans">
                <LockOutlinedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 pr-10 py-2.5 h-11 border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? (
                    <VisibilityOffIcon className="h-5 w-5" />
                  ) : (
                    <VisibilityIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-700/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowForwardIcon className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Info / Divider */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-2xs font-extrabold text-slate-400 tracking-wide uppercase">
            <span>VMS LITE INTEGRATION</span>
            <Link href="/register" className="text-blue-500 hover:underline">
              Visitor Sign-up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
