"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Loader2 } from "lucide-react";

/**
 * Login page client component.
 * Simple email + password form using Firebase auth via the auth context.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigatingToHome, setIsNavigatingToHome] = useState(false);
  const { login, isLoggedIn } = useAuth();

  const router = useRouter();
  const { toast } = useToast();
  const navigatingFromSubmitRef = useRef(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !navigatingFromSubmitRef.current) {
      router.push("/admin");
    }
  }, [isLoggedIn, router]);

  /**
   * Handle form submission for email/password login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login(email, password);

      const userName = userData.name || userData.email.split("@")[0] || "User";

      navigatingFromSubmitRef.current = true;
      setIsNavigatingToHome(true);

      toast({
        title: `Welcome back, ${userName}!`,
        description: "You have successfully logged in.",
      });

      setEmail("");
      setPassword("");

      router.push("/admin");
    } catch (error: unknown) {
      const axiosErr = error as {
        response?: { data?: { error?: string }; status?: number };
      };
      const serverMessage = axiosErr?.response?.data?.error;
      toast({
        title: "Login Failed",
        description:
          serverMessage || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (!navigatingFromSubmitRef.current) setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),transparent_65%)]">
      {/* Background overlay layer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.3),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05),transparent_60%)]"></div>

      <div className="relative z-10 w-full">
        <div className="flex min-h-screen items-center justify-center">
          {/* Left Side - SVG Background (decorative) */}
          <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-8 lg:p-12">
            <div className="absolute inset-0 opacity-25 dark:opacity-20">
              <Image
                src="/stock_inventory.svg"
                alt="Stock Inventory Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="relative z-10 max-w-2xl w-full space-y-6">
              <div className="rounded-[28px] border border-sky-400/30 dark:border-white/10 bg-gradient-to-br from-sky-500/25 via-sky-500/10 to-sky-500/5 dark:from-white/5 dark:via-white/5 dark:to-white/5 backdrop-blur-sm shadow-[0_30px_80px_rgba(2,132,199,0.35)] dark:shadow-lg p-4 sm:p-8">
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight text-center">
                  Zivert Kiosk Admin
                </h1>
                <p className="text-md lg:text-lg text-gray-700 dark:text-white/80 font-medium leading-relaxed text-center">
                  Manage your products, categories, warehouses, and stock
                  allocations from a single dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-0 sm:p-8 lg:p-12">
            <div className="w-full max-w-md rounded-[28px] border border-sky-400/30 dark:border-white/10 bg-gradient-to-br from-sky-500/25 via-sky-500/10 to-sky-500/5 dark:from-white/5 dark:via-white/5 dark:to-white/5 backdrop-blur-sm shadow-[0_30px_80px_rgba(2,132,199,0.35)] dark:shadow-lg p-4 sm:p-8 transition-all duration-300 hover:shadow-[0_40px_100px_rgba(2,132,199,0.5)] dark:hover:shadow-[0_40px_100px_rgba(2,132,199,0.4)] hover:border-sky-300/50 dark:hover:border-sky-300/30">
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl sm:text-2xl font-semibold text-gray-900 dark:text-white text-center">
                  Welcome Back
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-white/70 text-center">
                  Sign in to your account to continue
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-white/80"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-sky-400/30 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus-visible:border-sky-400 focus-visible:ring-sky-500/50 shadow-[0_10px_30px_rgba(2,132,199,0.15)]"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 dark:text-white/80"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-sky-400/30 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus-visible:border-sky-400 focus-visible:ring-sky-500/50 shadow-[0_10px_30px_rgba(2,132,199,0.15)]"
                  />
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full rounded-xl border border-sky-400/30 dark:border-sky-400/40 bg-gradient-to-r from-sky-500/70 via-sky-500/50 to-sky-500/30 dark:from-sky-500/80 dark:via-sky-500/60 dark:to-sky-500/40 text-white shadow-[0_15px_35px_rgba(2,132,199,0.45)] backdrop-blur-sm transition duration-200 hover:border-sky-300/60 dark:hover:border-sky-300/60 hover:from-sky-500/90 hover:via-sky-500/70 hover:to-sky-500/50 dark:hover:from-sky-500/90 dark:hover:via-sky-500/70 dark:hover:to-sky-500/50 hover:shadow-[0_20px_45px_rgba(2,132,199,0.6)]"
                  disabled={isLoading || isNavigatingToHome}
                >
                  {isNavigatingToHome ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Dashboard...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
